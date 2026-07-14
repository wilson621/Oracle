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
            IntPtr windowHandle =
                ParseWindowHandle(
                    arguments
                );

            WindowObservation observation =
                ObserveWindow(
                    windowHandle
                );

            string json =
                JsonSerializer.Serialize(
                    observation,
                    JsonOptions
                );

            Console.Out.Write(json);

            return 0;
        }
        catch (Exception exception)
        {
            Console.Error.Write(
                CreateSafeErrorMessage(
                    exception
                )
            );

            return 1;
        }
    }

    private static IntPtr ParseWindowHandle(
        IReadOnlyList<string> arguments
    )
    {
        if (arguments.Count != 1)
        {
            throw new ArgumentException(
                "Oracle.WindowObserver requires exactly one native window handle."
            );
        }

        string suppliedHandle =
            arguments[0].Trim();

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
            throw new ArgumentException(
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
            windowHandle
                .ToInt64()
                .ToString(
                    CultureInfo.InvariantCulture
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

    private sealed record WindowBounds(
        int X,
        int Y,
        int Width,
        int Height
    );

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
    }
}