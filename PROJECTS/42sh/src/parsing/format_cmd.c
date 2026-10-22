/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** parse_cmd.c
*/

#include <string.h>
#include <stdlib.h>
#include "formatsh.h"
#include "my.h"
#include "mysh.h"

static int is_multiple_delim(char *str, int i)
{
    if ((str[i] == DELIMS[1] &&
        str[i + 1] != '\0' && str[i + 1] == DELIMS[1]) ||
        (str[i] == DELIMS[2] &&
        str[i + 1] != '\0' && str[i + 1] == DELIMS[2]) ||
        (str[i] == DELIMS[3] &&
        str[i + 1] != '\0' && str[i + 1] == DELIMS[3]) ||
        (str[i] == DELIMS[3] &&
        str[i + 1] != '\0' && str[i + 1] == DELIMS[3]) ||
        (str[i] == DELIMS[4] &&
        str[i + 1] != '\0' && str[i + 1] == DELIMS[4]))
        return EDGE_OPERATOR;
    return SUCCESS;
}

int is_delim(char *str, int i)
{
    if ((i > 0 && str[i - 1] != ' ') ||
        (str[i + 1] != '\0' && str[i + 1] != ' ')) {
        if (str[i] == DELIMS[0])
            return BASIC_OPERATOR;
        if (is_multiple_delim(str, i) == EDGE_OPERATOR)
            return EDGE_OPERATOR;
        if (str[i] == DELIMS[1] || str[i] == DELIMS[2] || str[i] == DELIMS[3]
            || str[i] == DELIMS[5] || str[i] == DELIMS[6])
            return BASIC_OPERATOR;
    }
    return SUCCESS;
}

static void fill_char_delim(char *last, char *new_str, int *index_new, int i)
{
    new_str[*index_new] = ' ';
    new_str[*index_new + 1] = last[i];
    new_str[*index_new + 2] = ' ';
    *index_new += 2;
}

static void fill_char_edgecase(char *last, char *new_str,
    int *index_new, int *i)
{
    new_str[*index_new] = ' ';
    new_str[*index_new + 1] = last[*i];
    new_str[*index_new + 2] = last[*i + 1];
    new_str[*index_new + 3] = ' ';
    *index_new += 3;
    *i += 1;
}

static char *create_new_str(char *last, char *new_str)
{
    int index_new = 0;
    int delim = 0;
    int between = false;

    for (int i = 0; last[i] != '\0'; i++) {
        between = is_between_str(last, i, *str_management[OPEN_PARE],
            *str_management[CLOSE_PARE]);
        delim = is_delim(last, i);
        if (delim == BASIC_OPERATOR && between == SKIP) {
            fill_char_delim(last, new_str, &index_new, i);
        }
        if (delim == EDGE_OPERATOR && between == SKIP) {
            fill_char_edgecase(last, new_str, &index_new, &i);
        }
        if (delim == 0 || between != SKIP)
            new_str[index_new] = last[i];
        index_new += 1;
    }
    return new_str;
}

static int get_nb_spaces(char *str)
{
    int delim = 0;
    int nb_spaces = 0;

    for (int i = 0; str[i] != '\0'; i++) {
        if (is_between_str(str, i, *str_management[OPEN_PARE],
            *str_management[CLOSE_PARE]) != SKIP)
            continue;
        delim = is_delim(str, i);
        if (delim == BASIC_OPERATOR)
            nb_spaces += 2;
        if (delim == EDGE_OPERATOR) {
            nb_spaces += 2;
            i++;
        }
    }
    return nb_spaces;
}

char *format_cmd(char *str)
{
    int len = strlen(str);
    char *new_str = NULL;
    int nb_spaces = get_nb_spaces(str);

    new_str = malloc(sizeof(char) * (len + nb_spaces + 1));
    if (new_str == NULL)
        return NULL;
    new_str[len + nb_spaces] = '\0';
    return create_new_str(str, new_str);
}
