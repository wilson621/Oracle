using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

internal static class OracleStage5CleanHostFixtureProvider
{
    private const string Email = "oracle-stage5-clean-host@example.invalid";
    private const string Password = "Oracle-Stage5-CleanHost-Only!";
    private const string UserId = "55555555-5555-4555-8555-555555555555";
    private static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
    private static readonly DateTimeOffset Confirmed = new DateTimeOffset(2026, 8, 4, 0, 0, 0, TimeSpan.Zero);
    private static volatile bool running = true;

    public static int Main(string[] args)
    {
        try
        {
            int port = ParsePort(args);
            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs eventArgs) {
                eventArgs.Cancel = true;
                running = false;
                listener.Stop();
            };
            listener.Start();
            Console.Out.WriteLine("ORACLE_STAGE5_FIXTURE_READY " + port);
            Console.Out.Flush();
            while (running)
            {
                try { Handle(listener.GetContext()); }
                catch (HttpListenerException) { if (running) throw; }
            }
            listener.Close();
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.ToString());
            return 1;
        }
    }

    private static int ParsePort(string[] args)
    {
        if (args.Length != 2 || args[0] != "--port") throw new ArgumentException("Usage: Oracle.Stage5CleanHostFixtureProvider.exe --port <loopback-port>");
        int port;
        if (!Int32.TryParse(args[1], out port) || port < 1024 || port > 65535) throw new ArgumentException("Fixture port is invalid.");
        return port;
    }

    private static void Handle(HttpListenerContext context)
    {
        HttpListenerRequest request = context.Request;
        HttpListenerResponse response = context.Response;
        response.Headers["Cache-Control"] = "no-store";
        ApplyCors(request, response);
        if (request.HttpMethod == "OPTIONS") { response.StatusCode = 204; response.Close(); return; }

        string path = request.Url.AbsolutePath;
        if (path == "/health" && request.HttpMethod == "GET") { WriteJson(response, 200, new Dictionary<string, object> { { "result", "passed" }, { "classification", "STAGE5-CLEAN-HOST-RENDERING-FIXTURE" } }); return; }
        if (path == "/auth/v1/token" && request.HttpMethod == "POST") { HandleToken(request, response); return; }
        if (path == "/auth/v1/user" && request.HttpMethod == "GET") { if (!HasBearer(request)) { WriteError(response, 401, "missing bearer token"); return; } WriteJson(response, 200, User()); return; }
        if (path == "/auth/v1/logout" && request.HttpMethod == "POST") { response.StatusCode = 204; response.Close(); return; }
        if (path == "/auth/v1/signup" && request.HttpMethod == "POST") { WriteError(response, 403, "fixture account creation is prohibited"); return; }
        if (path.StartsWith("/rest/v1/", StringComparison.Ordinal) && (request.HttpMethod == "GET" || request.HttpMethod == "HEAD")) { WriteJson(response, 200, new object[0]); return; }
        if (path.StartsWith("/rest/v1/rpc/", StringComparison.Ordinal) && request.HttpMethod == "POST") { WriteJson(response, 200, new object[0]); return; }
        WriteError(response, 404, "unsupported clean-host fixture endpoint");
    }

    private static void HandleToken(HttpListenerRequest request, HttpListenerResponse response)
    {
        string grant = request.QueryString["grant_type"] ?? "";
        string body;
        using (StreamReader reader = new StreamReader(request.InputStream, request.ContentEncoding ?? Encoding.UTF8)) body = reader.ReadToEnd();
        if (grant == "password")
        {
            Dictionary<string, object> input = String.IsNullOrWhiteSpace(body) ? new Dictionary<string, object>() : Json.Deserialize<Dictionary<string, object>>(body);
            string email = input.ContainsKey("email") ? Convert.ToString(input["email"]) : "";
            string password = input.ContainsKey("password") ? Convert.ToString(input["password"]) : "";
            if (!String.Equals(email, Email, StringComparison.Ordinal) || !String.Equals(password, Password, StringComparison.Ordinal)) { WriteError(response, 400, "invalid fixture credentials"); return; }
        }
        else if (grant != "refresh_token") { WriteError(response, 400, "unsupported fixture grant"); return; }
        WriteJson(response, 200, Session());
    }

    private static Dictionary<string, object> Session()
    {
        return new Dictionary<string, object> {
            { "access_token", Token() }, { "token_type", "bearer" }, { "expires_in", 7200 },
            { "expires_at", DateTimeOffset.UtcNow.AddHours(2).ToUnixTimeSeconds() }, { "refresh_token", "oracle-stage5-clean-host-refresh-token" }, { "user", User() }
        };
    }

    private static Dictionary<string, object> User()
    {
        string instant = Confirmed.ToString("o");
        return new Dictionary<string, object> {
            { "id", UserId }, { "aud", "authenticated" }, { "role", "authenticated" }, { "email", Email },
            { "email_confirmed_at", instant }, { "confirmed_at", instant }, { "last_sign_in_at", instant },
            { "app_metadata", new Dictionary<string, object> { { "provider", "email" }, { "providers", new string[] { "email" } } } },
            { "user_metadata", new Dictionary<string, object> { { "display_name", "Stage 5 Clean Host Fixture" } } },
            { "identities", new object[0] }, { "created_at", instant }, { "updated_at", instant }, { "is_anonymous", false }
        };
    }

    private static string Token()
    {
        string header = Base64Url("{\"alg\":\"none\",\"typ\":\"JWT\"}");
        long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        string payload = Json.Serialize(new Dictionary<string, object> { { "aud", "authenticated" }, { "exp", now + 7200 }, { "iat", now }, { "sub", UserId }, { "email", Email }, { "role", "authenticated" } });
        return header + "." + Base64Url(payload) + ".fixture";
    }

    private static string Base64Url(string value) { return Convert.ToBase64String(Encoding.UTF8.GetBytes(value)).TrimEnd('=').Replace('+', '-').Replace('/', '_'); }
    private static bool HasBearer(HttpListenerRequest request) { string value = request.Headers["Authorization"] ?? ""; return value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) && value.Length > 20; }

    private static void ApplyCors(HttpListenerRequest request, HttpListenerResponse response)
    {
        string origin = request.Headers["Origin"];
        if (!String.IsNullOrEmpty(origin) && (origin.StartsWith("http://127.0.0.1:", StringComparison.Ordinal) || origin.StartsWith("http://localhost:", StringComparison.Ordinal)))
        {
            response.Headers["Access-Control-Allow-Origin"] = origin;
            response.Headers["Vary"] = "Origin";
            response.Headers["Access-Control-Allow-Credentials"] = "true";
        }
        response.Headers["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info, x-supabase-api-version";
        response.Headers["Access-Control-Allow-Methods"] = "GET, HEAD, POST, OPTIONS";
    }

    private static void WriteError(HttpListenerResponse response, int status, string message) { WriteJson(response, status, new Dictionary<string, object> { { "error", message }, { "error_description", message } }); }
    private static void WriteJson(HttpListenerResponse response, int status, object value)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(Json.Serialize(value));
        response.StatusCode = status; response.ContentType = "application/json; charset=utf-8"; response.ContentLength64 = bytes.Length;
        response.OutputStream.Write(bytes, 0, bytes.Length); response.OutputStream.Flush(); response.Close();
    }
}
