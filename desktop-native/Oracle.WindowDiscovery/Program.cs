using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Oracle.WindowDiscovery;

internal static partial class Program
{
    private const int DwmwaCloaked = 14;

    private static readonly JsonSerializerOptions JsonOptions =
        new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition =
                JsonIgnoreCondition.Never,
            WriteIndented = false,
        };

    private static int Main()
    {
        try
        {
            IReadOnlyList<DiscoveredWindow> windows =
                WindowEnumerator.Discover();

            string json = JsonSerializer.Serialize(
                windows,
                JsonOptions
            );

            Console.Out.Write(json);

            return 0;
        }
        catch (Exception exception)
        {
            Console.Error.Write(
                CreateSafeErrorMessage(exception)
            );

            return 1;
        }
    }

    private static string CreateSafeErrorMessage(
        Exception exception
    )
    {
        string message = exception.Message.Trim();

        return message.Length > 0
            ? message
            : "Oracle native window discovery failed.";
    }

    private sealed record DiscoveredWindow(
        string Handle,
        string Title,
        int ProcessId,
        string? ProcessName,
        bool Visible,
        bool Minimized,
        int X,
        int Y,
        int Width,
        int Height
    );

    private static class WindowEnumerator
    {
        public static IReadOnlyList<DiscoveredWindow> Discover()
        {
            List<DiscoveredWindow> windows = [];

            bool completed = NativeMethods.EnumWindows(
                (windowHandle, _) =>
                {
                    TryAddWindow(
                        windowHandle,
                        windows
                    );

                    return true;
                },
                IntPtr.Zero
            );

            if (!completed)
            {
                int errorCode =
                    Marshal.GetLastWin32Error();

                throw new InvalidOperationException(
                    $"EnumWindows failed with Win32 error {errorCode}."
                );
            }

            windows.Sort(CompareWindows);

            return windows;
        }

        private static void TryAddWindow(
            IntPtr windowHandle,
            ICollection<DiscoveredWindow> windows
        )
        {
            if (
                windowHandle == IntPtr.Zero ||
                !NativeMethods.IsWindowVisible(
                    windowHandle
                )
            )
            {
                return;
            }

            if (IsCloaked(windowHandle))
            {
                return;
            }

            string? title = GetWindowTitle(
                windowHandle
            );

            if (string.IsNullOrWhiteSpace(title))
            {
                return;
            }

            if (
                !NativeMethods.GetWindowRect(
                    windowHandle,
                    out NativeMethods.Rect rectangle
                )
            )
            {
                return;
            }

            int width =
                rectangle.Right - rectangle.Left;

            int height =
                rectangle.Bottom - rectangle.Top;

            if (width <= 0 || height <= 0)
            {
                return;
            }

            _ = NativeMethods.GetWindowThreadProcessId(
                windowHandle,
                out uint nativeProcessId
            );

            if (
                nativeProcessId >
                int.MaxValue
            )
            {
                return;
            }

            int processId =
                (int)nativeProcessId;

            string? processName =
                GetProcessName(processId);

            windows.Add(
                new DiscoveredWindow(
                    Handle:
                        windowHandle
                            .ToInt64()
                            .ToString(
                                System.Globalization
                                    .CultureInfo
                                    .InvariantCulture
                            ),
                    Title: title,
                    ProcessId: processId,
                    ProcessName: processName,
                    Visible: true,
                    Minimized:
                        NativeMethods.IsIconic(
                            windowHandle
                        ),
                    X: rectangle.Left,
                    Y: rectangle.Top,
                    Width: width,
                    Height: height
                )
            );
        }

        private static string? GetWindowTitle(
            IntPtr windowHandle
        )
        {
            int titleLength =
                NativeMethods.GetWindowTextLength(
                    windowHandle
                );

            if (titleLength <= 0)
            {
                return null;
            }

            StringBuilder titleBuilder =
                new(titleLength + 1);

            int copiedCharacters =
                NativeMethods.GetWindowText(
                    windowHandle,
                    titleBuilder,
                    titleBuilder.Capacity
                );

            if (copiedCharacters <= 0)
            {
                return null;
            }

            string title =
                titleBuilder.ToString().Trim();

            return title.Length > 0
                ? title
                : null;
        }

        private static string? GetProcessName(
            int processId
        )
        {
            if (processId <= 0)
            {
                return null;
            }

            try
            {
                using Process process =
                    Process.GetProcessById(
                        processId
                    );

                string processName =
                    process.ProcessName.Trim();

                return processName.Length > 0
                    ? processName
                    : null;
            }
            catch (
                ArgumentException
            )
            {
                return null;
            }
            catch (
                InvalidOperationException
            )
            {
                return null;
            }
            catch (
                System.ComponentModel
                    .Win32Exception
            )
            {
                return null;
            }
            catch (
                NotSupportedException
            )
            {
                return null;
            }
        }

        private static bool IsCloaked(
            IntPtr windowHandle
        )
        {
            int result =
                NativeMethods
                    .DwmGetWindowAttribute(
                        windowHandle,
                        DwmwaCloaked,
                        out int cloaked,
                        sizeof(int)
                    );

            return result == 0 &&
                cloaked != 0;
        }

        private static int CompareWindows(
            DiscoveredWindow left,
            DiscoveredWindow right
        )
        {
            if (
                left.Minimized !=
                right.Minimized
            )
            {
                return left.Minimized
                    ? 1
                    : -1;
            }

            int titleComparison =
                StringComparer
                    .OrdinalIgnoreCase
                    .Compare(
                        left.Title,
                        right.Title
                    );

            if (titleComparison != 0)
            {
                return titleComparison;
            }

            return left.ProcessId.CompareTo(
                right.ProcessId
            );
        }
    }

    private static partial class NativeMethods
    {
        internal delegate bool EnumWindowsCallback(
            IntPtr windowHandle,
            IntPtr parameter
        );

        [StructLayout(LayoutKind.Sequential)]
        internal struct Rect
        {
            internal int Left;
            internal int Top;
            internal int Right;
            internal int Bottom;
        }

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool EnumWindows(
            EnumWindowsCallback callback,
            IntPtr parameter
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool IsWindowVisible(
            IntPtr windowHandle
        );

        [LibraryImport(
            "user32.dll",
            EntryPoint =
                "GetWindowTextLengthW",
            SetLastError = true
        )]
        internal static partial int GetWindowTextLength(
            IntPtr windowHandle
        );

        [DllImport(
    "user32.dll",
    EntryPoint = "GetWindowTextW",
    CharSet = CharSet.Unicode,
    SetLastError = true
)]
internal static extern int GetWindowText(
    IntPtr windowHandle,
    StringBuilder text,
    int maximumLength
);

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool GetWindowRect(
            IntPtr windowHandle,
            out Rect rectangle
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        [return: MarshalAs(
            UnmanagedType.Bool
        )]
        internal static partial bool IsIconic(
            IntPtr windowHandle
        );

        [LibraryImport(
            "user32.dll",
            SetLastError = true
        )]
        internal static partial uint
            GetWindowThreadProcessId(
                IntPtr windowHandle,
                out uint processId
            );

        [LibraryImport("dwmapi.dll")]
        internal static partial int
            DwmGetWindowAttribute(
                IntPtr windowHandle,
                int attribute,
                out int value,
                int valueSize
            );
    }
}