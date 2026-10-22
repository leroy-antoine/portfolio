/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** setenv.c
*/

#include "my.h"
#include "mysh.h"
#include "formatsh.h"
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

static int replace_var(char *line, char **data)
{
    free(*data);
    *data = strdup(line);
    free(line);
    return EPI_SUCCESS;
}

static bool is_letter(char c, const char *str)
{
    for (int i = 0; str[i] != '\0'; i++)
        if (c == str[i])
            return true;
    return false;
}

static bool correct_name_var(char *var)
{
    if (var == NULL)
        return false;
    if (is_letter(*var, first_env_char_allowed) == false) {
        dprintf(STDERR_FILENO, "%s", str_message[SETENV_LETTER]);
        return false;
    }
    for (int i = 0; var[i] != '\0'; i++)
        if (is_letter(var[i], env_char_allowed) == false) {
            dprintf(STDERR_FILENO, "%s", str_message[SETENV_ALNUM]);
            return false;
        }
    return true;
}

static bool is_env_var_line(char *line, const char *var)
{
    char *line_dup = strdup(line);
    char *line_var = NULL;

    if (line_dup == NULL)
        return false;
    line_var = strtok_r(line_dup, str_management[EQUAL], &line_dup);
    if (line_var == NULL || strcmp(line_var, var) != 0) {
        free(line_var);
        return false;
    }
    free(line_var);
    return true;
}

int change_or_create(const char *var, char *value, linked_list_t *env)
{
    node_t *node = env->head;
    char *data = NULL;
    char *line = my_strcat_inf(
        3, (char *)var, (char *)str_management[EQUAL], value);

    if (line == NULL)
        return EPI_ERROR;
    while (node != NULL) {
        if (is_env_var_line((char *)node->data, var) == true) {
            replace_var(line, (char **)(&node->data));
            return EPI_SUCCESS;
        }
        node = node->next;
    }
    data = create_env_var(line);
    if (data == NULL)
        return EPI_ERROR;
    push_to_tail(env, data);
    free(line);
    return EPI_SUCCESS;
}

int do_setenv(char **args, system_t *sys)
{
    int list_len = my_list_len(args);

    if (list_len > 3) {
        dprintf(STDERR_FILENO, "%s", str_message[SETENV_TOO_MANY]);
        return COMMAND_ERROR;
    }
    if (list_len == 1)
        return do_env(args, sys);
    if (correct_name_var(args[1]) == false)
        return COMMAND_ERROR;
    if (change_or_create(args[1], args[2], sys->env) == EPI_ERROR)
        return COMMAND_ERROR;
    return EPI_SUCCESS;
}
