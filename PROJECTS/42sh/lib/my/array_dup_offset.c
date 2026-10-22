/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** arrray_dup_offset.c
*/

#include <string.h>
#include <stdlib.h>
#include "my.h"

char **array_dup_offset(char **list, int offset)
{
    int len = array_len(list);
    char **dup = NULL;

    if (len == -1)
        return NULL;
    dup = calloc(len + 1, sizeof(char *));
    if (dup == NULL)
        return NULL;
    for (int i = 0; i < len; ++i) {
        dup[i] = strdup(list[i] + offset);
        if (dup[i] == NULL)
            return NULL;
    }
    free_list(list);
    return dup;
}
