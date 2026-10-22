/*
** EPITECH PROJECT, 2025
** star
** File description:
** star.c
*/

#include <stdio.h>
#include <string.h>
#include <dirent.h>
#include <stdlib.h>
#include <stdbool.h>
#include <glob.h>
#include <unistd.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

static void get_files(char ***argv, size_t *i, bool *is_found)
{
    glob_t globing = {0};

    if (glob((*argv)[*i], GLOB_ERR, NULL, &globing) != EPI_SUCCESS) {
        del_index(*argv, *i);
        --(*i);
        return;
    }
    *is_found = true;
    *argv = insert(*argv, *i, globing.gl_pathv, globing.gl_pathc);
    globfree(&globing);
}

static int is_star(char const *str)
{
    for (int i = 0; str[i] != '\0'; ++i)
        if (str[i] == *str_management[STAR])
            return 1;
    return EPI_SUCCESS;
}

static int is_change_star(char **argv)
{
    for (int i = 0; argv[i] != NULL; ++i)
        if (is_star(argv[i]) == 1)
            return 1;
    return EPI_SUCCESS;
}

int handle_star(char ***argv)
{
    bool is_match = false;

    if (*argv == NULL)
        return EPI_ERROR;
    if (is_change_star(*argv) == EPI_SUCCESS)
        return EPI_SUCCESS;
    for (size_t i = 0; (*argv)[i] != NULL; ++i) {
        if (is_star((*argv)[i]) == 1)
            get_files(argv, &i, &is_match);
        if (*argv == NULL) {
            is_match = false;
            break;
        }
    }
    if (is_match == false || *argv == NULL) {
        dprintf(STDERR_FILENO, str_message[NO_MATCH_STAR],
            (*argv) == NULL ? "" : (*argv)[0]);
        return EPI_ERROR;
    }
    return EPI_SUCCESS;
}
