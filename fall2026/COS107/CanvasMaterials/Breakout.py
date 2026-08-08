import random
import turtle


# ============================================================
# 1. GAME SETTINGS
# ============================================================

WINDOW_WIDTH = 1050
WINDOW_HEIGHT = 650

LEFT_WALL = -500
RIGHT_WALL = 500
TOP_WALL = 300
BOTTOM_WALL = -300

PADDLE_Y = -250
PADDLE_HALF_WIDTH = 100
PADDLE_HALF_HEIGHT = 10
PADDLE_MOVE_DISTANCE = 30

BALL_RADIUS = 10
BALL_START_SPEED = 5

# About 60 screen updates per second
FRAME_DELAY = 16


# ============================================================
# 2. CREATE THE GAME WINDOW
# ============================================================

screen = turtle.Screen()
screen.title("Paddle Ball Game")
screen.bgcolor("light gray")
screen.setup(width=WINDOW_WIDTH, height=WINDOW_HEIGHT)

# Turn off automatic screen updates.
# We will update the screen manually for smoother animation.
screen.tracer(0)


# ============================================================
# 3. CREATE THE PADDLE
# ============================================================

paddle = turtle.Turtle()
paddle.shape("square")
paddle.color("blue")
paddle.shapesize(stretch_wid=1, stretch_len=10)
paddle.penup()
paddle.goto(0, PADDLE_Y)


# ============================================================
# 4. CREATE THE BALL
# ============================================================

ball = turtle.Turtle()
ball.shape("circle")
ball.color("red")
ball.penup()
ball.goto(0, 0)

# Store the ball's horizontal and vertical movement speeds.
ball.dx = BALL_START_SPEED
ball.dy = -BALL_START_SPEED


# ============================================================
# 5. CREATE THE SCORE DISPLAY
# ============================================================

score = 0
misses = 0

score_writer = turtle.Turtle()
score_writer.hideturtle()
score_writer.penup()
score_writer.color("purple")
score_writer.goto(0, 270)


def update_scoreboard():
    """Clear and redraw the score information."""

    score_writer.clear()
    score_writer.write(
        f"Score: {score}     Misses: {misses}",
        align="center",
        font=("Courier", 22, "bold")
    )


update_scoreboard()


# ============================================================
# 6. PADDLE MOVEMENT FUNCTIONS
# ============================================================

def move_paddle_left():
    """Move the paddle to the left."""

    new_x = paddle.xcor() - PADDLE_MOVE_DISTANCE

    # Keep the entire paddle inside the left wall.
    minimum_x = LEFT_WALL + PADDLE_HALF_WIDTH

    if new_x < minimum_x:
        new_x = minimum_x

    paddle.setx(new_x)


def move_paddle_right():
    """Move the paddle to the right."""

    new_x = paddle.xcor() + PADDLE_MOVE_DISTANCE

    # Keep the entire paddle inside the right wall.
    maximum_x = RIGHT_WALL - PADDLE_HALF_WIDTH

    if new_x > maximum_x:
        new_x = maximum_x

    paddle.setx(new_x)


# Listen for keyboard input.
screen.listen()

screen.onkeypress(move_paddle_left, "Left")
screen.onkeypress(move_paddle_right, "Right")

# Also allow A and D controls.
screen.onkeypress(move_paddle_left, "a")
screen.onkeypress(move_paddle_right, "d")


# ============================================================
# 7. BALL FUNCTIONS
# ============================================================

def reset_ball():
    """Return the ball to the center after the player misses."""

    ball.goto(0, 0)

    # Randomly launch the ball toward the left or right.
    ball.dx = random.choice([-BALL_START_SPEED, BALL_START_SPEED])
    ball.dy = -BALL_START_SPEED


def check_wall_collisions():
    """Make the ball bounce off the top, left, and right walls."""

    # Right wall
    if ball.xcor() + BALL_RADIUS >= RIGHT_WALL:
        ball.setx(RIGHT_WALL - BALL_RADIUS)
        ball.dx = -abs(ball.dx)

    # Left wall
    if ball.xcor() - BALL_RADIUS <= LEFT_WALL:
        ball.setx(LEFT_WALL + BALL_RADIUS)
        ball.dx = abs(ball.dx)

    # Top wall
    if ball.ycor() + BALL_RADIUS >= TOP_WALL:
        ball.sety(TOP_WALL - BALL_RADIUS)
        ball.dy = -abs(ball.dy)


def check_paddle_collision():
    """Check whether the ball hits the paddle."""

    global score

    paddle_left = paddle.xcor() - PADDLE_HALF_WIDTH
    paddle_right = paddle.xcor() + PADDLE_HALF_WIDTH
    paddle_top = paddle.ycor() + PADDLE_HALF_HEIGHT
    paddle_bottom = paddle.ycor() - PADDLE_HALF_HEIGHT

    ball_bottom = ball.ycor() - BALL_RADIUS

    hit_paddle = (
        ball.dy < 0
        and paddle_bottom <= ball_bottom <= paddle_top
        and paddle_left - BALL_RADIUS
        <= ball.xcor()
        <= paddle_right + BALL_RADIUS
    )

    if hit_paddle:
        # Put the ball above the paddle so it does not become stuck.
        ball.sety(paddle_top + BALL_RADIUS)

        # Make the ball travel upward.
        ball.dy = abs(ball.dy)

        # Change the horizontal direction depending on where
        # the ball strikes the paddle.
        hit_position = (
            ball.xcor() - paddle.xcor()
        ) / PADDLE_HALF_WIDTH

        ball.dx += hit_position * 2

        # Prevent the horizontal speed from becoming too fast.
        ball.dx = max(-8, min(8, ball.dx))

        score += 1
        update_scoreboard()


def check_for_miss():
    """Reset the ball when it falls below the game board."""

    global misses

    if ball.ycor() - BALL_RADIUS <= BOTTOM_WALL:
        misses += 1
        update_scoreboard()
        reset_ball()


# ============================================================
# 8. MAIN GAME LOOP
# ============================================================

def game_loop():
    """Move the ball and repeatedly update the game."""

    # Move the ball.
    ball.setx(ball.xcor() + ball.dx)
    ball.sety(ball.ycor() + ball.dy)

    # Check all game events.
    check_wall_collisions()
    check_paddle_collision()
    check_for_miss()

    # Display the latest positions.
    screen.update()

    # Run this function again after a short delay.
    screen.ontimer(game_loop, FRAME_DELAY)


# Start the game.
game_loop()

# Keep the Turtle window open.
screen.mainloop()