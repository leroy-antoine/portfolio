/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** del_line.c
*/

#include <string.h>
#include <math.h>
#include <stdio.h>
#include <unistd.h>
#include "mysh.h"
#include "formatsh.h"

static int is_str_term_caps(char const *str)
{
    int len = 0;

    for (unsigned int i = BLUE; i < ARRAY_SIZE(str_term_caps); i++) {
        len = strlen(str_term_caps[i]);
        if (strncmp(str_term_caps[i], str, len) == 0)
            return len;
    }
    return SUCCESS;
}

void del_line(char *str, char *buff, int nb_col)
{
    double len = (double)strlen(str);
    int nb = 0;

    if (buff != NULL)
        len += (double)strlen(buff) - OFFSET;
    for (int i = 0; str[i] != '\0'; i++)
        len -= is_str_term_caps(str + i);
    nb = ceil(len / nb_col);
    for (int i = 0; i < nb + 1; i++) {
        dprintf(STDOUT_FILENO, "%s", str_term_caps[DEL_LINE]);
        if (i + 1 < nb)
            dprintf(STDOUT_FILENO, "%s", str_term_caps[M_CURSOR_UP]);
    }
}
