#pragma once
#include <afxwin.h>
#include "DrawingView.h"
#include "NetworkManager.h"

class MultiUserDrawingApp : public CWinApp {
public:
    virtual BOOL InitInstance();
private:
    CFrameWnd* frame;
    DrawingView* view;
    NetworkManager network;
};
