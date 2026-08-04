using System;
using System.Drawing;
using System.Windows.Forms;

public static class OracleStage5GameWindowFixture
{
    [STAThread]
    public static void Main()
    {
        Application.EnableVisualStyles();
        var form = new Form
        {
            Text = "Call of Duty: Warzone - Oracle Stage 5 disposable fixture",
            Width = 1280,
            Height = 720,
            StartPosition = FormStartPosition.CenterScreen
        };
        form.Controls.Add(new Label
        {
            Text = "NON-PRODUCTION ORACLE STAGE 5 WINDOW-DISCOVERY FIXTURE",
            AutoSize = true,
            Font = new Font("Segoe UI", 16),
            Left = 40,
            Top = 40
        });
        Application.Run(form);
    }
}
