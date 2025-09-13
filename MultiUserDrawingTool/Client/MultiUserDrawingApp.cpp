#include "MultiUserDrawingApp.h"

BOOL MultiUserDrawingApp::InitInstance() {
    frame = new CFrameWnd();
    frame->Create(NULL, _T("Multi-User Drawing App"));

    view = new DrawingView();
    view->Create(NULL, NULL, WS_CHILD | WS_VISIBLE, CRect(0,0,800,600), frame, 1);
    view->setNetworkManager(&network);

    frame->ShowWindow(SW_SHOW);
    frame->UpdateWindow();

    network.connectToServer("127.0.0.1", 9999);
    network.setOnMessageReceived([this](const std::string& msg) {
        // Parse and draw received line
        // Example: "x1,y1,x2,y2"
        int x1, y1, x2, y2;
        sscanf(msg.c_str(), "%d,%d,%d,%d", &x1,&y1,&x2,&y2);
        CClientDC dc(view);
        dc.MoveTo(x1, y1);
        dc.LineTo(x2, y2);
    });

    return TRUE;
}

MultiUserDrawingApp theApp;
