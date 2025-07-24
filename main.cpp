// Level 1
#include "raylib.h"
#include <cmath>
#include <iostream>
#include <vector>
using namespace std;

// All the constants
const int screenWidth = 1280;
const int screenHeight = 720;
const float gravity = 0.7f;
const float jumpForce = -12.0f;
const float moveAcceleration = 0.2f;
const float maxSpeed = 5.0f;
const float friction = 1.0f;
const float virtualWidth = (float)screenWidth;
const float virtualHeight = (float)screenHeight;

int level = 0;

// Level Data

struct LevelData
{
    string name;
    vector<int> data;
};

struct Level
{
    string name;
    vector<LevelData> levelData;
};

Level Levels[5] = {
    {"Level 1",
     {
         {"orbs", {1}},
         {"numberWalls", {1, 0}},
         {"key", {0}},
         {"wall", {static_cast<int>(virtualWidth / 2), 0, 50, static_cast<int>(virtualHeight - 100)}},
     }},
    {"Level 2",
     {
         {"orbs", {1}},
         {"numberWalls", {0, 0}},
         {"key", {1, 0, static_cast<int>(virtualWidth / 2), 100}},
     }},
    {"Level 3",
     {
         {"orbs", {1}},
         {"numberWalls", {1, 1}},
         {"key", {0}},
         {"wall", {static_cast<int>(virtualWidth / 2 - 100), 0, 50, static_cast<int>(virtualHeight - 100)}},
         {"Qwall", {static_cast<int>(virtualWidth / 2 + 100), 0, 50, static_cast<int>(virtualHeight - 100)}},
     }},
    {"Level 4",
     {
         {"orbs", {1}},
         {"numberWalls", {1, 1}},
         {"key", {0}},
         {"wall", {static_cast<int>(virtualWidth / 2 - 50), static_cast<int>(virtualHeight / 2), 50, static_cast<int>(virtualHeight / 2 - 100)}},
         {"Qwall", {static_cast<int>(virtualWidth / 2 - 100), 0, 50, static_cast<int>(virtualHeight - 100)}},
     }},
    {"Level 5",
     {
         {"orbs", {1}},
         {"numberWalls", {2, 4}},
         {"key", {0}},
         {"wall", {static_cast<int>(virtualWidth / 2 - 300), static_cast<int>(virtualHeight / 2), static_cast<int>(virtualWidth / 2 + 250), 25}},
         {"wall", {static_cast<int>(virtualWidth / 2 - 200), static_cast<int>(virtualHeight / 2 + 22), 25, static_cast<int>(virtualWidth /2 - 400)}},
         {"Qwall", {static_cast<int>(virtualWidth / 2 - 200), 0, 50, static_cast<int>(virtualHeight - 100)}},
         {"Qwall", {0, 0, static_cast<int>(virtualWidth/2 - 300), static_cast<int>(virtualHeight - 100)}},
         {"Qwall", {static_cast<int>(virtualWidth/2 - 300), 0, 100, static_cast<int>(virtualHeight / 2 - 100)}},
         {"Qwall", {static_cast<int>(virtualWidth/2 - 300), static_cast<int>(virtualHeight-175), 100, 75}},
     }},
};

// The player structure
struct Player
{
    Rectangle rect;
    Vector2 velocity;
    bool jumping;
    Color color;
};

int main()
{
    // Orbs counter
    int orbs = (float)Levels[level].levelData[0].data[0];
    // Dragging state
    bool dragging = false;
    Vector2 dragOffset = {0, 0};
    // Pause state
    bool paused = false;
    // Menu open?
    bool menuOpen = false;
    // Initialize the window
    SetConfigFlags(FLAG_WINDOW_UNDECORATED);
    InitWindow(screenWidth, screenHeight, ("Quantum Odyssey"));
    SetTargetFPS(60);

    int currentScreenWidth = screenWidth;
    int currentScreenHeight = screenHeight;

    // Track the quantum state
    bool QS = false;

    // Player
    Player player;
    player.rect = {100, 300, 50, 84};
    player.velocity = {0, 0};
    player.jumping = false;
    player.color = ORANGE;

    // Grounds
    Rectangle ground = {0.0f, virtualHeight - 100.0f, virtualWidth, 100.0f};

    // --- Trail storage ---
    // std::vector<Vector2> playerTrail;
    // playerTrail.push_back({player.rect.x + player.rect.width / 2, player.rect.y + player.rect.height / 2});

    // load portal textures
    Texture2D portalTexture = LoadTexture("portal.png");

    Texture2D portalLockedTexture = LoadTexture("portal locked.png");

    // load key texture
    Texture2D keyTexture = LoadTexture("pKey.png");

    while (!WindowShouldClose())
    {
        // Handle the window resizing (must be before mouse logic)
        int windowWidth = GetScreenWidth();
        int windowHeight = GetScreenHeight();
        float scaleX = (float)windowWidth / virtualWidth;
        float scaleY = (float)windowHeight / virtualHeight;
        float scale = fminf(scaleX, scaleY);
        int viewportWidth = (int)(virtualWidth * scale);
        int viewportHeight = (int)(virtualHeight * scale);
        int viewportX = (windowWidth - viewportWidth) / 2;
        int viewportY = (windowHeight - viewportHeight) / 2;

        // Mouse position in virtual coordinates
        Vector2 mouse = GetMousePosition();
        // Convert mouse to virtual coordinates (undo letterbox/zoom)
        mouse.x = (mouse.x - viewportX) / scale;
        mouse.y = (mouse.y - viewportY) / scale;

        // Toggle pause with P
        if (IsKeyPressed(KEY_P))
        {
            paused = !paused;
            dragging = false; // stop dragging if paused
        }

        if (!paused)
        {
            // Start dragging if mouse pressed inside player
            Rectangle enlargedPlayerRect = {player.rect.x - 10, player.rect.y - 10, player.rect.width + 20, player.rect.height + 20};
            if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON) &&
                CheckCollisionPointRec(mouse, enlargedPlayerRect) && QS)
            {
                dragging = true;
                dragOffset.x = mouse.x - player.rect.x;
                dragOffset.y = mouse.y - player.rect.y;
            }
            // Stop dragging if mouse released
            if (IsMouseButtonReleased(MOUSE_LEFT_BUTTON) || !QS)
            {
                dragging = false;
            }
            // While dragging, update player position (but not through ground or Qwalls in QS)
            if (dragging)
            {
                float newX = mouse.x - dragOffset.x;
                float newY = mouse.y - dragOffset.y;
                // Prevent dragging through ground
                if (newY + player.rect.height > ground.y)
                {
                    newY = ground.y - player.rect.height;
                }
                int numberWalls = Levels[level].levelData[1].data[0];
                int numberQWalls = Levels[level].levelData[1].data[1];
                // Prevent dragging through Qwalls when in QS
                if (QS && numberQWalls > 0)
                {
                    // For each Qwall, if the player's new rect would cross the Qwall boundary, stop at the edge (no teleporting through)
                    for (int i = 3 + numberWalls; i < 3 + numberWalls + numberQWalls; i++)
                    {
                        Rectangle qwall = {(float)Levels[level].levelData[i].data[0], (float)Levels[level].levelData[i].data[1], (float)Levels[level].levelData[i].data[2], (float)Levels[level].levelData[i].data[3]};
                        Rectangle prevPlayerRect = player.rect;
                        Rectangle newPlayerRect = {newX, newY, player.rect.width, player.rect.height};
                        // If the new position would be past the qwall (not just colliding), clamp to the edge
                        // Check left side
                        if (prevPlayerRect.x + prevPlayerRect.width <= qwall.x && newPlayerRect.x + newPlayerRect.width > qwall.x)
                        {
                            newX = qwall.x - newPlayerRect.width;
                        }
                        // Check right side
                        if (prevPlayerRect.x >= qwall.x + qwall.width && newPlayerRect.x < qwall.x + qwall.width)
                        {
                            newX = qwall.x + qwall.width;
                        }
                        // Check top side
                        if (prevPlayerRect.y + prevPlayerRect.height <= qwall.y && newPlayerRect.y + newPlayerRect.height > qwall.y)
                        {
                            newY = qwall.y - newPlayerRect.height;
                        }
                        // Check bottom side
                        if (prevPlayerRect.y >= qwall.y + qwall.height && newPlayerRect.y < qwall.y + qwall.height)
                        {
                            newY = qwall.y + qwall.height;
                        }
                        // If the new rect is inside the qwall (teleport), clamp to previous position
                        if (CheckCollisionRecs(newPlayerRect, qwall))
                        {
                            // Only allow movement up to the edge, not inside
                            newX = prevPlayerRect.x;
                            newY = prevPlayerRect.y;
                        }
                    }
                }
                player.rect.x = newX;
                player.rect.y = newY;
                // Zero velocity while dragging
                player.velocity = {0, 0};
            }
            // Movement when not in QS and not dragging
            if (!QS && !dragging)
            {
                if (IsKeyDown(KEY_A))
                {
                    if (player.velocity.x > -maxSpeed)
                        player.velocity.x -= moveAcceleration;
                    if (player.velocity.x < -maxSpeed)
                        player.velocity.x = -maxSpeed;
                }
                else if (IsKeyDown(KEY_D))
                {
                    if (player.velocity.x < maxSpeed)
                        player.velocity.x += moveAcceleration;
                    if (player.velocity.x > maxSpeed)
                        player.velocity.x = maxSpeed;
                }
                else
                {
                    // Apply friction when no keys pressed
                    if (fabs(player.velocity.x) < friction)
                    {
                        player.velocity.x = 0;
                    }
                    else
                    {
                        player.velocity.x -= friction * ((player.velocity.x > 0) ? 1 : -1);
                    }
                }
            }
        }
        else
        {
            // If paused, ensure player can't be dragged
            dragging = false;
        }

        if (!paused)
        {
            // Quantum State Toggle
            if (IsKeyPressed(KEY_E) && (orbs > 0 || QS))
            {
                QS = !QS;
                if (QS)
                {
                    orbs--;
                    // When entering QS, if player is inside a Qwall, push them out
                    int numberWalls = Levels[level].levelData[1].data[0];
                    int numberQWalls = Levels[level].levelData[1].data[1];
                    for (int i = 3 + numberWalls; i < 3 + numberWalls + numberQWalls; i++)
                    {
                        Rectangle qwall = {(float)Levels[level].levelData[i].data[0], (float)Levels[level].levelData[i].data[1], (float)Levels[level].levelData[i].data[2], (float)Levels[level].levelData[i].data[3]};
                        if (CheckCollisionRecs(player.rect, qwall))
                        {
                            float overlapLeft = (player.rect.x + player.rect.width) - qwall.x;
                            float overlapRight = (qwall.x + qwall.width) - player.rect.x;
                            float overlapTop = (player.rect.y + player.rect.height) - qwall.y;
                            float overlapBottom = (qwall.y + qwall.height) - player.rect.y;
                            float minOverlap = fmin(fmin(overlapLeft, overlapRight), fmin(overlapTop, overlapBottom));
                            if (minOverlap == overlapLeft)
                                player.rect.x = qwall.x - player.rect.width;
                            else if (minOverlap == overlapRight)
                                player.rect.x = qwall.x + qwall.width;
                            else if (minOverlap == overlapTop)
                                player.rect.y = qwall.y - player.rect.height;
                            else if (minOverlap == overlapBottom)
                                player.rect.y = qwall.y + qwall.height;
                        }
                    }
                }
            }

            if (IsKeyPressed(KEY_R))
            {
                player.rect = {100, 300, 50, 84};
                orbs = (float)Levels[level].levelData[0].data[0];
                QS = false;
                player.velocity = {0, 0};
                if ((float)Levels[level].levelData[2].data[0] != 0)
                {
                    Levels[level].levelData[2].data[1] = 0;
                }
                // Reset trail
                // playerTrail.clear();
                // playerTrail.push_back({player.rect.x + player.rect.width / 2, player.rect.y + player.rect.height / 2});
            }
            if (IsKeyPressed(KEY_S))
            {
                // check collision with portal
                Rectangle portal = {(float)(screenWidth - 125), (float)(screenHeight - 225), 125.0f, 125.0f};
                if (CheckCollisionRecs(player.rect, portal) && (sizeof(Levels) / sizeof(Levels[0]) > level + 1))
                {
                    // Allow level up if: key is not required (data[0] != 1), or if key is required (data[0] == 1) and key has been collected (data[1] == 1)
                    if ((Levels[level].levelData[2].data[0] != 1) ||
                        (Levels[level].levelData[2].data[0] == 1 && Levels[level].levelData[2].data[1] == 1))
                    {
                        level++;
                        player.rect = {100, 300, 50, 84};
                        orbs = (float)Levels[level].levelData[0].data[0];
                        QS = false;
                        player.velocity = {0, 0};
                        if ((float)Levels[level].levelData[2].data[0] != 0)
                        {
                            Levels[level].levelData[2].data[1] = 0;
                        }
                        // Reset trail
                        // playerTrail.clear();
                        // playerTrail.push_back({player.rect.x + player.rect.width / 2, player.rect.y + player.rect.height / 2});
                    }
                }
                if ((float)Levels[level].levelData[2].data[0] > 0)
                {
                    Rectangle key = {(float)Levels[level].levelData[2].data[2], (float)Levels[level].levelData[2].data[3], 100.0f, 37.5f};
                    if (CheckCollisionRecs(player.rect, key))
                    {
                        Levels[level].levelData[2].data[1] = 1;
                        // change portal texture to unlocked
                    }
                }
            }

            // Set player color based on quantum state and whether on ground
            if (QS)
            {
                player.color = PURPLE;
                player.velocity = {0, 0};
            }
            else
            {
                player.color = ORANGE;
            }

            // Move player horizontally (if not dragging)
            if (!dragging)
                player.rect.x += player.velocity.x;

            // Jump
            if ((IsKeyPressed(KEY_SPACE) || IsKeyPressed(KEY_W)) && !player.jumping && !dragging)
            {
                player.velocity.y = jumpForce;
                player.jumping = true;
            }

            // Apply gravity when not in QS and not dragging
            if (!QS && !dragging)
            {
                player.velocity.y += gravity;
                player.rect.y += player.velocity.y;
            }

            // --- Trail update ---
            // Vector2 newPos = {player.rect.x + player.rect.width / 2, player.rect.y + player.rect.height / 2};
            // if (playerTrail.empty() || (playerTrail.back().x != newPos.x || playerTrail.back().y != newPos.y))
            // {
            //     playerTrail.push_back(newPos);
            // }

            // Collision with ground
            if (CheckCollisionRecs(player.rect, ground))
            {
                player.rect.y = ground.y - player.rect.height;
                player.velocity.y = 0;
                player.jumping = false;
            }
            else
            {
                player.jumping = true;
            }
            // Keep player within screen bounds
            if (player.rect.x < 0)
            {
                player.rect.x = 0;
                player.velocity.x = 0;
            }
            else if (player.rect.x + player.rect.width > screenWidth)
            {
                player.rect.x = screenWidth - player.rect.width;
                player.velocity.x = 0;
            }
            if (player.rect.y - 50 < 0)
            {
                player.rect.y = 50;
            }

            // Collision with wall (disabled in QS)
            int numberWalls = Levels[level].levelData[1].data[0];
            if (!QS)
            {
                for (int i = 3; i < 3 + numberWalls; i++)
                {
                    Rectangle wall = {(float)Levels[level].levelData[i].data[0], (float)Levels[level].levelData[i].data[1], (float)Levels[level].levelData[i].data[2], (float)Levels[level].levelData[i].data[3]};
                    if (CheckCollisionRecs(player.rect, wall))
                    {
                        // Determine which side the collision happened
                        float overlapLeft = (player.rect.x + player.rect.width) - wall.x;
                        float overlapRight = (wall.x + wall.width) - player.rect.x;
                        float overlapTop = (player.rect.y + player.rect.height) - wall.y;
                        float overlapBottom = (wall.y + wall.height) - player.rect.y;

                        float minOverlap = fmin(fmin(overlapLeft, overlapRight), fmin(overlapTop, overlapBottom));
                        if (minOverlap == overlapLeft)
                        {
                            // Collision from left
                            player.rect.x = wall.x - player.rect.width;
                            player.velocity.x = 0;
                        }
                        else if (minOverlap == overlapRight)
                        {
                            // Collision from right
                            player.rect.x = wall.x + wall.width;
                            player.velocity.x = 0;
                        }
                        else if (minOverlap == overlapTop)
                        {
                            // Collision from top
                            player.rect.y = wall.y - player.rect.height;
                            player.velocity.y = 0;
                            player.jumping = false;
                        }
                        else if (minOverlap == overlapBottom)
                        {
                            // Collision from bottom
                            player.rect.y = wall.y + wall.height;
                            player.velocity.y = 0;
                        }
                    }
                }
            }
        }

        // Draw
        BeginDrawing();
        ClearBackground(BLACK);

        BeginScissorMode(viewportX, viewportY, viewportWidth, viewportHeight);
        BeginMode2D((Camera2D){.offset = {0, 0}, .target = {0, 0}, .rotation = 0, .zoom = scale});
        ClearBackground(Color{47, 139, 251, 255});

        // if (playerTrail.size() > 50)
        // {
        //     playerTrail.erase(playerTrail.begin(), playerTrail.begin() + (playerTrail.size() - 50));
        // }
        // if (playerTrail.size() > 1)
        // {
        //     for (size_t i = 1; i < playerTrail.size(); ++i)
        //     {
        //         DrawLineEx(playerTrail[i - 1], playerTrail[i], 3, RED);
        //     }
        // }

        DrawTextureEx(((float)Levels[level].levelData[2].data[0] == 0 ? portalTexture : (float)Levels[level].levelData[2].data[1] != 0 ? portalTexture
                                                                                                                                       : portalLockedTexture),
                      (Vector2){(float)(screenWidth - 125), (float)(screenHeight - 225)}, 0.0f, 0.25f, WHITE);

        if ((float)Levels[level].levelData[2].data[0] == 1 && (float)Levels[level].levelData[2].data[1] == 0)
        {
            DrawTextureEx(keyTexture, (Vector2){(float)Levels[level].levelData[2].data[2], (float)Levels[level].levelData[2].data[3]}, 0.0f, 0.5f, WHITE);
        }
        // draw the ground

        DrawRectangleRec(ground, DARKGREEN);
        // draw Qwalls first
        int numberWalls = Levels[level].levelData[1].data[0];
        int numberQWalls = Levels[level].levelData[1].data[1];
        for (int i = 3 + numberWalls; i < 3 + numberWalls + numberQWalls; i++)
        {
            Rectangle wall = {(float)Levels[level].levelData[i].data[0], (float)Levels[level].levelData[i].data[1], (float)Levels[level].levelData[i].data[2], (float)Levels[level].levelData[i].data[3]};
            if (!QS)
            {
                DrawRectangleRec(wall, Color{199, 255, 250, 255});
            }
            else
            {
                DrawRectangleRec(wall, Color{1, 134, 123, 255});
            }
        }
        // draw normal walls after Qwalls
        for (int i = 3; i < 3 + numberWalls; i++)
        {
            Rectangle wall = {(float)Levels[level].levelData[i].data[0], (float)Levels[level].levelData[i].data[1], (float)Levels[level].levelData[i].data[2], (float)Levels[level].levelData[i].data[3]};
            if (!QS)
            {
                DrawRectangleRec(wall, DARKBROWN);
            }
            else
            {
                DrawRectangleRec(wall, BROWN);
            }
        }

        if (player.color.r == ORANGE.r)
        { // Orange color
            DrawRectangleRec(player.rect, player.color);
            // Draw details
            DrawRectangle(player.rect.x + player.rect.width / 5 + player.velocity.x,
                          player.rect.y + player.rect.height / 4 + player.velocity.y / 4,
                          player.rect.width / 6, player.rect.height / 8, Color{255, 68, 0, 255});
            DrawRectangle(player.rect.x + player.rect.width / 1.5 + player.velocity.x,
                          player.rect.y + player.rect.height / 4 + player.velocity.y / 4,
                          player.rect.width / 6, player.rect.height / 8, Color{255, 68, 0, 255});
        }
        else if (player.color.r == PURPLE.r)
        { // Purple color
            DrawRectangleRec(player.rect, Color{168, 58, 136, 255});
        }
        else
        { // Red color
            DrawRectangle(player.rect.x, player.rect.y + 25, player.rect.width, player.rect.height - 25, player.color);
            // Draw the details
            DrawRectangle(player.rect.x + player.rect.width / 5 + player.velocity.x,
                          player.rect.y + 25 + player.rect.height / 4 + player.velocity.y,
                          player.rect.width / 6, player.rect.height / 8, Color{255, 102, 0, 255});
            DrawRectangle(player.rect.x + player.rect.width / 1.5 + player.velocity.x,
                          player.rect.y + 25 + player.rect.height / 4 + player.velocity.y,
                          player.rect.width / 6, player.rect.height / 8, Color{255, 102, 0, 255});
            DrawRectangle(player.rect.x + player.rect.width / 4 + player.velocity.x,
                          player.rect.y + 25 + player.rect.height / 3 + player.velocity.y,
                          player.rect.width / 2, (player.rect.height - 10) / 4, Color{238, 85, 34, 255});
        }

        DrawText(TextFormat("Orbs: %d", orbs), 10, 60, 24, DARKBROWN);
        // Drawing the top bar
        DrawRectangle(0, 0, screenWidth, 50, DARKBLUE);
        if (paused)
        {
            DrawText(("Quantum Odyssey - Level " + std::to_string(level + 1)).c_str(), 10, 7, 32, RAYWHITE);
            DrawText("PAUSED", screenWidth / 2 - MeasureText("PAUSED", 32) / 2, 7, 32, RAYWHITE);
        }
        else
        {
            DrawText(("Quantum Odyssey - Level " + std::to_string(level + 1)).c_str(), 10, 7, 32, RAYWHITE);
        }
        if (mouse.x > screenWidth - 50 && mouse.y < 50)
        {
            DrawRectangle(screenWidth - 50, 0, 50, 50, RED);
            DrawLineEx((Vector2){screenWidth - 40.0f, 10}, (Vector2){screenWidth - 10.0f, 40}, 10, RAYWHITE);
            DrawLineEx((Vector2){screenWidth - 10.0f, 10}, (Vector2){screenWidth - 40.0f, 40}, 10, RAYWHITE);
            if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON))
            {
                CloseWindow();
            }
        }
        else
        {
            DrawRectangle(screenWidth - 50, 0, 50, 50, BLUE);
            DrawLineEx((Vector2){screenWidth - 40.0f, 10}, (Vector2){screenWidth - 10.0f, 40}, 10, RAYWHITE);
            DrawLineEx((Vector2){screenWidth - 10.0f, 10}, (Vector2){screenWidth - 40.0f, 40}, 10, RAYWHITE);
        }

        // End drawing
        EndMode2D();
        EndScissorMode();
        EndDrawing();
    }

    CloseWindow();
    return 0;
}