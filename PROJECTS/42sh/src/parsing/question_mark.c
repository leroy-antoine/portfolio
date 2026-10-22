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

static int add_to_selection(size_t len, char *element,
    char **selection, int *count)
{
    if (len == strlen(element)) {
        selection[*count] = strdup(element);
        if (selection[*count] == NULL)
            return EPI_ERROR;
        ++(*count);
    }
    return EPI_SUCCESS;
}

static char **change_selection(char **gl_pathv,
    int *nb_select, char const *origin_buff)
{
    size_t len = strlen(origin_buff);
    int count = 0;
    char **selection = NULL;

    for (int i = 0; gl_pathv[i] != NULL; ++i)
        if (len == strlen(gl_pathv[i]))
            ++(*nb_select);
    selection = calloc(*nb_select + 1, sizeof(char *));
    if (selection == NULL)
        return NULL;
    for (int i = 0; gl_pathv[i] != NULL; ++i)
        if (add_to_selection(len, gl_pathv[i], selection, &count) == EPI_ERROR)
            return NULL;
    return selection;
}

static void get_files(char ***argv, size_t *i, bool *is_found)
{
    glob_t globing = {0};
    char **selecion = NULL;
    int nb_select = 0;

    for (int j = 0; (*argv)[*i][j] != '\0'; ++j)
        if ((*argv)[*i][j] == *str_management[QUESTION])
            (*argv)[*i][j] = *str_management[STAR];
    if (glob((*argv)[*i], GLOB_ERR, NULL, &globing) != EPI_SUCCESS) {
        globfree(&globing);
        return;
    }
    selecion = change_selection(globing.gl_pathv, &nb_select, (*argv)[*i]);
    globfree(&globing);
    if (selecion == NULL || nb_select == 0) {
        del_index(*argv, *i);
        --(*i);
        return;
    }
    *is_found = true;
    *argv = insert(*argv, *i, selecion, nb_select);
}

static int is_question_mark(char const *str)
{
    for (int i = 0; str[i] != '\0'; ++i)
        if (str[i] == *str_management[QUESTION])
            return 1;
    return EPI_SUCCESS;
}

static int is_change_question_mark(char **argv)
{
    for (int i = 0; argv[i] != NULL; ++i)
        if (is_question_mark(argv[i]) == 1)
            return COMMAND_ERROR;
    return EPI_SUCCESS;
}

static void parse_argv(char ***argv, bool *is_match)
{
    for (size_t i = 0; (*argv)[i] != NULL; ++i) {
        if (is_question_mark((*argv)[i]) == 1)
            get_files(argv, &i, is_match);
        if (*argv == NULL) {
            is_match = false;
            break;
        }
    }
}

void error_question_mark(char ***argv, char *first)
{
    dprintf(STDERR_FILENO, str_message[NO_MATCH_STAR],
        (*argv) == NULL ? "" : first);
}

int handle_question_mark(char ***argv)
{
    bool is_match = false;
    char *first = NULL;

    if (*argv == NULL)
        return EPI_ERROR;
    first = strdup((*argv)[0]);
    if (first == NULL)
        return EPI_ERROR;
    if (is_change_question_mark(*argv) == EPI_SUCCESS) {
        free(first);
        return EPI_SUCCESS;
    }
    parse_argv(argv, &is_match);
    if (is_match == false || *argv == NULL) {
        error_question_mark(argv, first);
        free(first);
        return EPI_ERROR;
    }
    free(first);
    return EPI_SUCCESS;
}
