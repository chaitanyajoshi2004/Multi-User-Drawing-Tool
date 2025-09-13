#pragma once

struct DrawLineMessage {
    int startX;
    int startY;
    int endX;
    int endY;
    int color; // RGB integer
};

enum MessageType {
    DRAW_LINE = 1
};
