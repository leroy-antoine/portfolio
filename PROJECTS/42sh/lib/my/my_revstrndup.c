/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** my_revstrndup.c
*/

#include <unistd.h>
#include <string.h>
#include <stdlib.h>

char *my_revstrndup(char *str, int n)
{
    char *dest = NULL;
    size_t i = 0;
    int k = 0;

    str[strlen(str)] = '\0';
    for (int j = n; str[j] != '\0'; j++) {
        i++;
    }
    dest = calloc(strlen(str) + 1, sizeof(char));
    if (dest == NULL)
        return NULL;
    while (i < strlen(str)) {
        dest[k] = str[i];
        i++;
        k++;
    }
    dest[k] = '\0';
    return dest;
}
