#pragma once
#include <afxwin.h>
#include "NetworkManager.h"

class DrawingView : public CWnd {
public:
    DrawingView();
    void setNetworkManager(NetworkManager* manager);
protected:
    afx_msg void OnPaint();
    afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
    afx_msg void OnMouseMove(UINT nFlags, CPoint point);
    DECLARE_MESSAGE_MAP()
private:
    CPoint lastPoint;
    bool drawing;
    NetworkManager* network;
};
