/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** dup_list.c
*/

#include <stdlib.h>
#include <string.h>
#include "my.h"

char **dup_list_ij(char **list, int i, int j)
{
    char **dup = NULL;
    int len = my_list_len(list);
    int count = 0;

    if (list == NULL || i < 0 || j < 0 || i >= j || i > len || j > len)
        return NULL;
    dup = malloc(sizeof(char *) * (j - i + 1));
    if (dup == NULL)
        return NULL;
    for (int k = i; k < j; k++) {
        dup[count] = strdup(list[k]);
        if (dup[count] == NULL)
            return NULL;
        count++;
    }
    dup[count] = NULL;
    return dup;
}

char **dup_list(char **list)
{
    char **dup = NULL;
    int len = my_list_len(list);

    if (list == NULL)
        return NULL;
    dup = malloc(sizeof(char *) * (len + 1));
    if (dup == NULL)
        return NULL;
    for (int i = 0; list[i] != NULL; i++) {
        dup[i] = strdup(list[i]);
        if (dup[i] == NULL)
            return NULL;
    }
    dup[len] = NULL;
    return dup;
}
