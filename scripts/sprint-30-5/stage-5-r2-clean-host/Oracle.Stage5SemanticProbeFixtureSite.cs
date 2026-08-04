using System;
using System.Net;
using System.Text;

internal static class OracleStage5SemanticProbeFixtureSite
{
    public static int Main(string[] args)
    {
        try
        {
            if (args.Length != 2 || args[0] != "--port") throw new ArgumentException("Usage: fixture --port <port>");
            HttpListener listener = new HttpListener(); listener.Prefixes.Add("http://127.0.0.1:" + Int32.Parse(args[1]) + "/"); listener.Start();
            Console.CancelKeyPress += delegate(object sender, ConsoleCancelEventArgs e) { e.Cancel = true; listener.Stop(); };
            while (listener.IsListening)
            {
                try { HttpListenerContext c = listener.GetContext(); string body = c.Request.Url.AbsolutePath == "/auth" ? Auth() : Route(c.Request.Url.AbsolutePath); byte[] bytes = Encoding.UTF8.GetBytes(body); c.Response.StatusCode = 200; c.Response.ContentType = "text/html; charset=utf-8"; c.Response.ContentLength64 = bytes.Length; c.Response.OutputStream.Write(bytes, 0, bytes.Length); c.Response.Close(); }
                catch (HttpListenerException) { if (listener.IsListening) throw; }
            }
            return 0;
        }
        catch (Exception error) { Console.Error.WriteLine(error); return 1; }
    }
    private static string Auth() { return "<!doctype html><html lang='en'><head><style>body{background:#000;color:#fff}input,button{outline:2px solid #0ff}</style></head><body><main><h1>Auth</h1><form onsubmit=\"event.preventDefault();location.href='/oracle'\"><label>Email<input type='email'></label><label>Password<input type='password'></label><button>Sign in</button></form></main></body></html>"; }
    private static string Route(string path) { string title = WebUtility.HtmlEncode(path.Trim('/')); return "<!doctype html><html lang='en'><head><style>body{background:#000;color:#fff}a{color:#fff;outline:2px solid #0ff}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style></head><body><main><h1>" + title + "</h1><a href='/oracle'>Oracle</a><p>Clean host semantic self-test.</p></main></body></html>"; }
}
