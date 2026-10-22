/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** get_arrow.c
*/

#include <stdbool.h>
#include <unistd.h>
#include <termios.h>
#include <stdio_ext.h>
#include "mysh.h"

void get_arrow(char c, index_t *ind)
{
    int nb = 0;

    if (read(STDIN_FILENO, &c, sizeof(char)) == EOF)
        return;
    for (unsigned i = UP_ARROW; i < ARRAY_SIZE(move_func) + UP_ARROW; i++) {
        if (c == (char)i) {
            move_func[nb](ind);
        }
        nb++;
    }
    ind->esc = 0;
    return;
}
