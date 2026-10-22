/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** array
*/

#include <stdlib.h>
#include <string.h>
#include "my.h"

int array_len(char **array)
{
    int i = 0;

    if (array == NULL)
        return -1;
    while (array[i] != NULL)
        i++;
    return i;
}

void del_index(char **list, int index)
{
    int i = 0;

    while (i != index)
        ++i;
    free(list[i]);
    while (list[i] != NULL) {
        list[i] = list[i + 1];
        ++i;
    }
}

static void fill_array(char **new, char **dst, char **tab, int copy)
{
    int len = array_len(dst) + array_len(tab);
    int first = 0;
    int second = 0;

    for (int i = 0; i < len; i++) {
        if (i == copy) {
            free(dst[first]);
            first++;
        }
        if (i >= copy && tab[second] != NULL) {
            new[i] = tab[second];
            second++;
        } else {
            new[i] = dst[first];
            first++;
        }
    }
}

char **arraycat_n(char **dst, char **tab, int copy)
{
    int len = array_len(dst) + array_len(tab);
    char **new = malloc(sizeof(char *) * len);

    if (new == NULL)
        return NULL;
    fill_array(new, dst, tab, copy);
    free(dst);
    free(tab);
    return new;
}

static int copy_founds(char **argv, char **found, size_t nb_found)
{
    free(argv[0]);
    for (size_t i = 0; found[i] != NULL && i < nb_found; ++i) {
        argv[i] = strdup(found[i]);
        if (argv[i] == NULL)
            return EPI_ERROR;
    }
    return EPI_SUCCESS;
}

char **insert(char **argv, size_t index, char **found, size_t nb_found)
{
    char **final = NULL;
    size_t len = my_list_len(argv);
    size_t j = 0;

    if (index > len || argv == NULL || found == NULL)
        return NULL;
    final = calloc(len + nb_found + 1, sizeof(char *));
    if (final == NULL)
        return NULL;
    for (size_t i = 0; i < len + nb_found; ++i) {
        if (i == index) {
            copy_founds(&final[index], found, nb_found);
            i += nb_found - 1;
        } else
            final[i] = argv[j];
        ++j;
    }
    free(argv);
    return final;
}

static bool check_prev(char **tab, int ind, const char *prev, bool equal)
{
    int count = 0;

    for (int i = ind - 1; i >= 0; i--) {
        if (strcmp(tab[i], prev) == 0 && equal == false)
            return true;
        if (strcmp(tab[i], prev) == 0 && equal == true)
            count++;
    }
    if (count % 2 == 0)
        return false;
    return true;
}

static bool check_next(char **tab, int ind, const char *next, bool equal)
{
    int count = 0;

    for (int i = ind + 1; tab[i] != NULL; i++) {
        if (strcmp(tab[i], next) == 0 && equal == false)
            return true;
        if (strcmp(tab[i], next) == 0 && equal == true)
            count++;
    }
    if (count % 2 == 0)
        return false;
    return true;
}

bool is_between_list(char **tab, int ind, const char *prev, const char *next)
{
    bool equal = false;

    if (strcmp(next, prev) == 0)
        equal = true;
    if (check_prev(tab, ind, prev, equal) != true
        || check_next(tab, ind, next, equal) != true)
        return false;
    return true;
}
