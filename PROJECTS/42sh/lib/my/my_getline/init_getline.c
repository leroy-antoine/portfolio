/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** init_getline.c
*/

#include <stdbool.h>
#include <string.h>
#include <unistd.h>
#include <termios.h>
#include <stdlib.h>
#include <stdio_ext.h>
#include "formatsh.h"
#include "mysh.h"

index_t *init_getline(history_t *history)
{
    struct termios old = {0};
    index_t *tmp = malloc(sizeof(index_t));

    if (tcgetattr(STDIN_FILENO, &old) != SUCCESS || tmp == NULL)
        return NULL;
    tmp->buf = strdup("");
    if (tmp->buf == NULL) {
        my_free_str(&tmp->buf);
        return NULL;
    }
    tmp->old = old;
    tmp->index = 0;
    tmp->len = 0;
    tmp->esc = 0;
    tmp->exit = false;
    tmp->history = history;
    tmp->current_cmd = NULL;
    return tmp;
}
