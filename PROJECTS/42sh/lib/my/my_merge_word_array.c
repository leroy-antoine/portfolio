/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** my_merge_word_array
*/

#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "my.h"

static int copy_array(char **new_arr, char **arr, int *j)
{
    if (arr == NULL)
        return EPI_SUCCESS;
    for (int i = 0; arr[i] != NULL; i++){
        new_arr[*j] = strdup(arr[i]);
        if (new_arr[*j] == NULL){
            free_list(new_arr);
            return EPI_ERROR;
        }
        (*j)++;
    }
    return EPI_SUCCESS;
}

static int fill_new_array(char **new_arr, char **arr_1, char **arr_2,
    int new_arr_size)
{
    int j = 0;

    if (copy_array(new_arr, arr_1, &j) == EPI_ERROR)
        return EPI_ERROR;
    if (copy_array(new_arr, arr_2, &j) == EPI_ERROR)
        return EPI_ERROR;
    new_arr[new_arr_size] = NULL;
    return EPI_SUCCESS;
}

char **my_merge_word_array(char **arr_1, char **arr_2)
{
    int new_arr_size = 0;
    char **new_arr = NULL;

    if (arr_1 == NULL && arr_2 == NULL)
        return NULL;
    new_arr_size = my_list_len(arr_1) + my_list_len(arr_2);
    new_arr = malloc(sizeof(char *) * (new_arr_size + 1));
    if (new_arr == NULL)
        return NULL;
    if (fill_new_array(new_arr, arr_1, arr_2, new_arr_size) == EPI_ERROR)
        return NULL;
    return new_arr;
}
