/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_del.c
*/

#include <stdbool.h>
#include <unistd.h>
#include <termios.h>
#include <string.h>
#include <stdlib.h>
#include <stdio_ext.h>
#include "mysh.h"

static void create_new_string(index_t *ind, char *tmp_start,
    char *tmp_end, char *tmp)
{
    ind->buf = realloc(ind->buf, ind->len + 1);
    if (ind->buf == NULL)
        return;
    --ind->len;
    --ind->index;
    strcpy(tmp, tmp_start);
    strcat(tmp, tmp_end);
    strcpy(ind->buf, tmp);
    my_free_str(&tmp);
    my_free_str(&tmp_start);
    my_free_str(&tmp_end);
    return;
}

void exec_del(index_t *ind)
{
    char *tmp_start = strndup(ind->buf, ind->index - 1);
    char *tmp_end = my_revstrndup(ind->buf, ind->len - ind->index);
    char *tmp = calloc(strlen(ind->buf), sizeof(char));

    if (tmp_start == NULL || tmp_end == NULL || tmp == NULL)
        return;
    if (ind->index - 1 < 0) {
        my_free_str(&tmp);
        my_free_str(&tmp_start);
        my_free_str(&tmp_end);
        return;
    }
    create_new_string(ind, tmp_start, tmp_end, tmp);
    return;
}
