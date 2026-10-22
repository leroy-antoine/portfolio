/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** exec_esc.c
*/

#include <stdbool.h>
#include <unistd.h>
#include <termios.h>
#include <glob.h>
#include <string.h>
#include "mysh.h"
#include "my.h"

static void change_index(char const *buffer, int *index)
{
    while (buffer[*index] != ' ' && buffer[*index] != '\t')
        ++(*index);
}

static void split_string(char *buffer, int index, char **start, char **end)
{
    *start = strndup(buffer, index);
    if (*start == NULL) {
        *start = NULL;
        return;
    }
    change_index(buffer, &index);
    *end = strdup(buffer + index);
    if (*end == NULL) {
        *end = NULL;
        free(*start);
        return;
    }
}

void exec_tab(index_t *ind)
{
    char *start = NULL;
    char *end = NULL;
    char *tmp = ind->buf;

    if (ind->index == ind->len)
        return do_tab(ind);
    split_string(ind->buf, ind->index, &start, &end);
    if (start == NULL || end == NULL)
        return;
    ind->buf = start;
    do_tab(ind);
    ind->buf = my_strcat_inf(2, ind->buf, end);
    if (ind->buf == NULL) {
        ind->buf = tmp;
        return;
    }
    free(tmp);
    free(end);
    ind->len = strlen(ind->buf);
}
