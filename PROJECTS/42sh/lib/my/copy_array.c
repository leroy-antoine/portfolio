/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** copy_array
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void find_size(char **arr, ssize_t *size)
{
    while (arr[*size] != NULL) {
        *size += 1;
    }
    *size += 1;
}

char **copy_arr(char **arr)
{
    char **cpy = NULL;
    ssize_t size_arr = 0;

    if (arr == NULL)
        return NULL;
    find_size(arr, &size_arr);
    cpy = malloc(sizeof(char *) * (size_arr));
    if (cpy == NULL)
        return NULL;
    for (ssize_t i = 0; arr[i] != NULL; i++) {
        cpy[i] = strdup(arr[i]);
        if (cpy[i] == NULL)
            return NULL;
    }
    cpy[size_arr - 1] = NULL;
    return cpy;
}
