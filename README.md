# Boardgame


A collection of board games experiment. Each board game can be played against another human or the AI.

## Games

- [Chess](https://jacklehamster.github.io/boardgame/public/chess/)
  This is simply chess
- [Prime Chess](https://jacklehamster.github.io/boardgame/public/prime-chess/)
   This is a variant of chess where pieces move based on their numbers, and they change their numbers as they eat other pieces.
- [Cross Prime](https://jacklehamster.github.io/boardgame/public/cross-prime/)
  Simply take turn putting a number, going from 1 to 16. Maximize the sum of lines going your way, while minimizing the sum going the opponent's way, but be careful because only prime numbers count.
___
This project is meant for easily producing board games, along with an AI to play against. Feel free to use it to create your own board games.
---

## Background

Initially, this project was meant as a puzzle for the game ["The Impossible Room"](https://www.youtube.com/watch?v=eMolxvvxDdY). My goal was to produce a 1v1 board game that would be so complex for humans to play, yet easy for an AI to win. Thus, this game would be used as one of the impossible room that you cannot escape without beating the AI.

I started with Prime Chess. I figured that a game where numbers is involved would be very difficult for humans to play. That said, even playing at random sometimes lets the player beat the AI, or on occasion the game ends with nobody able to complete the game, given that pieces with even numbers are doomed to miss every other cell.

My second attempt was Cross Prime. This time, I was pretty sure that the AI, being able to calculate primes easily, would outperform a human. This is true for most of the time, but occasionally, playing at random does end up with victory.

At the end, I just decided to not include this into the Impossible Room. But I just kept these games around just for fun.
