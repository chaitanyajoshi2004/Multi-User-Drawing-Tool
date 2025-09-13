#include "DrawingView.h"

BEGIN_MESSAGE_MAP(DrawingView, CWnd)
    ON_WM_PAINT()
    ON_WM_LBUTTONDOWN()
    ON_WM_MOUSEMOVE()
END_MESSAGE_MAP()

DrawingView::DrawingView() : drawing(false), network(nullptr) {}

void DrawingView::setNetworkManager(NetworkManager* manager) {
    network = manager;
}

void DrawingView::OnPaint() {
    CPaintDC dc(this);
    // Here you could repaint all received lines (not implemented for brevity)
}

void DrawingView::OnLButtonDown(UINT nFlags, CPoint point) {
    lastPoint = point;
    drawing = true;
}

void DrawingView::OnMouseMove(UINT nFlags, CPoint point) {
    if(drawing && (nFlags & MK_LBUTTON)) {
        CClientDC dc(this);
        dc.MoveTo(lastPoint);
        dc.LineTo(point);

        if(network) {
            // Send line coordinates to server
            char buffer[64];
            sprintf(buffer, "%d,%d,%d,%d", lastPoint.x, lastPoint.y, point.x, point.y);
            network->sendMessage(buffer);
        }

        lastPoint = point;
    }
}
