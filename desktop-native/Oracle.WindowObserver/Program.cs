using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Oracle.WindowObserver;

internal static class Program
{
    private static readonly JsonSerializerOptions JsonOptions =
        new()
        {
            PropertyNamingPolicy =
                JsonNamingPolicy.CamelCase,

            DefaultIgnoreCondition =
                JsonIgnoreCondition.Never,

            WriteIndented = false,
        };

    private static int Main(
        string[] arguments
    )
    {
        try
        {
            if (arguments.Length == 0)
            {
                throw new CommandException(
                    "missing-command",
                    "Oracle.WindowObserver requires a command."
                );
            }

            string command =
                arguments[0].Trim().ToLowerInvariant();

            object result = command switch
            {
                "observe" =>
                    ExecuteObserveCommand(arguments),

                "foreground" =>
                    ExecuteForegroundCommand(arguments),

                _ => throw new CommandException(
                    "unknown-command",
                    $"Unknown Oracle.WindowObserver command '{arguments[0]}'."
                ),
            };

            WriteJson(
                Console.Out,
                result
            );

            return 0;
        }
        catch (CommandException exception)
        {
            WriteStructuredError(
                exception.Code,
                exception.Message
            );

            return 1;
        }
        catch (Exception exception)
        {
            WriteStructuredError(
                "native-observation-failed",
                CreateSafeErrorMessage(
                    exception
                )
            );

            return 1;
        }
    }

    private static WindowObservation ExecuteObserveCommand(
        IReadOnlyList<string> arguments
    )
    {
        if (arguments.Count != 2)
        {
            throw new CommandException(
                "invalid-handle",
                "The observe command requires exactly one native window handle."
            );
        }

        IntPtr windowHandle =
            ParseWindowHandle(
                arguments[1]
            );

        return ObserveWindow(
            windowHandle
        );
    }

    private static ForegroundWindowResult ExecuteForegroundCommand(
        IReadOnlyList<string> arguments
    )
    {
        if (arguments.Count != 1)
        {
            throw new CommandException(
                "unknown-command",
                "The foreground command does not accept additional arguments."
            );
        }

        IntPtr foregroundHandle =
            NativeMethods.GetForegroundWindow();

        string? serialisedHandle =
            foregroundHandle == IntPtr.Zero
                ? null
                : SerialiseWindowHandle(
                    foregroundHandle
                );

        return new ForegroundWindowResult(
            Success: true,
            ForegroundHandle:
                serialisedHandle
        );
    }

    private static IntPtr ParseWindowHandle(
        string suppliedValue
    )
    {
        string suppliedHandle =
            suppliedValue.Trim();

        if (
            suppliedHandle.Length == 0 ||
            !long.TryParse(
                suppliedHandle,
                NumberStyles.Integer,
                CultureInfo.InvariantCulture,
                out long numericHandle
            ) ||
            numericHandle == 0
        )
        {
            throw new CommandException(
                "invalid-handle",
                "The supplied native window handle is invalid."
            );
        }

        return new IntPtr(
            numericHandle
        );
    }

    private static WindowObservation ObserveWindow(
        IntPtr windowHandle
    )
    {
        string serialisedHandle =
            SerialiseWindowHandle(
                windowHandle
            );

        bool exists =
            NativeMethods.IsWindow(
                windowHandle
            );

        if (!exists)
        {
            return new WindowObservation(
                Handle:
                    serialisedHandle,

                Exists: false,
                Visible: false,
                Minimized: false,

                Bounds: null
            );
        }

        bool visible =
            NativeMethods.IsWindowVisible(
                windowHandle
            );

        bool minimized =
            NativeMethods.IsIconic(
                windowHandle
            );

        WindowBounds? bounds =
            TryReadWindowBounds(
                windowHandle
            );

        return new WindowObservation(
            Handle:
                serialisedHandle,

            Exists: true,
            Visible: visible,
            Minimized: minimized,

            Bounds: bounds
        );
    }

    private static WindowBounds? TryReadWindowBounds(
        IntPtr windowHandle
    )
    {
        if (
            !NativeMethods.GetWindowRect(
                windowHandle,
                out NativeMethods.Rect rectangle
            )
        )
        {
            return null;
        }

        int width =
            rectangle.Right -
            rectangle.Left;

        int height =
            rectangle.Bottom -
            rectangle.Top;

        if (
            width <= 0 ||
            height <= 0
        )
        {
            return null;
        }

        return new WindowBounds(
            X: rectangle.Left,
            Y: rectangle.Top,
            Width: width,
            Height: height
        );
    }

    private static string SerialiseWindowHandle(
        IntPtr windowHandle
    )
    {
        return windowHandle
            .ToInt64()
            .ToString(
                CultureInfo.InvariantCulture
            );
    }

    private static void WriteStructuredError(
        string code,
        string message
    )
    {
        WriteJson(
            Console.Error,
            new NativeErrorResult(
                Success: false,
                Error: new NativeError(
                    Code: code,
                    Message: message
                )
            )
        );
    }

    private static void WriteJson<T>(
        TextWriter writer,
        T value
    )
    {
        string json =
            JsonSerializer.Serialize(
                value,
                JsonOptions
            );

        writer.Write(json);
    }

    private static string CreateSafeErrorMessage(
        Exception exception
    )
    {
        string message =
            exception.Message.Trim();

        return message.Length > 0
            ? message
            : "Oracle native window observation failed.";
    }

    private sealed record WindowObservation(
        string Handle,
        bool Exists,
        bool Visible,
        bool Minimized,
        WindowBounds? Bounds
    );

    private sealed record ForegroundWindowResult(
        bool Success,
        string? ForegroundHandle
    );

    private sealed record NativeErrorResult(
        bool Success,
        NativeError Error
    );

    private sealed record NativeError(
        string Code,
        string Message
    );

    private sealed record WindowBounds(
        int X,
        int Y,
        int Width,
        int Height
    );

    private sealed class CommandException : Exception
    {
        internal CommandException(
            string code,
            string message
        ) : base(message)
        {
            Code = code;
        }

        internal string Code { get; }
    }

    private static class NativeMethods
    {
        [StructLayout(
            LayoutKind.Sequential
        )]
        internal struct Rect
        {
            internal int Left;
            internal int Top;
            internal int Right;
            internal int Bottom;
        }

        [DllImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static extern bool IsWindow(
            IntPtr windowHandle
        );

        [DllImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static extern bool IsWindowVisible(
            IntPtr windowHandle
        );

        [DllImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static extern bool IsIconic(
            IntPtr windowHandle
        );

        [DllImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static extern bool GetWindowRect(
            IntPtr windowHandle,
            out Rect rectangle
        );

        [DllImport(
            "user32.dll"
        )]
        internal static extern IntPtr GetForegroundWindow();
    }
}