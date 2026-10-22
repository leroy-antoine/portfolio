/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** strdup_delim.c
*/

#include <stddef.h>
#include <stdlib.h>

char *my_strdup_delim(char const *path, char c)
{
    int len = 0;
    char *str = NULL;
    int i = 0;

    while (path[len] != '\0' && path[len] != c)
        len++;
    str = malloc(len + 1);
    if (str == NULL)
        return NULL;
    while (path[i] != '\0' && path[i] != c) {
        str[i] = path[i];
        i++;
    }
    str[i] = '\0';
    return str;
}
