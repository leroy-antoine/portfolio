/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_new_line.c
*/

#include <stdbool.h>
#include <stdio.h>
#include <unistd.h>
#include <termios.h>
#include <string.h>
#include <stdio_ext.h>
#include "mysh.h"

void exec_new_line(index_t *ind)
{
    if (ind->buf == NULL) {
        ind->buf = strdup("");
    }
    ind->buf = realloc(ind->buf, strlen(ind->buf) + 2);
    if (ind->buf == NULL)
        return;
    ind->buf = strcat(ind->buf, "\n");
    write(1, "\n", 1);
    ind->exit = true;
    ind->current_cmd = NULL;
    return;
}
