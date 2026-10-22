/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** var
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <string.h>
#include <unistd.h>

static int is_envvar(char *var, char **value, linked_list_t *list)
{
    node_t *head = list->head;
    char *tmp = NULL;
    int len = strlen(var);

    if (*value != NULL)
        return SUCCESS;
    while (head != NULL) {
        tmp = (char *)head->data;
        if (strncmp(tmp, var, len) == 0
            && tmp[len] == *str_management[EQUAL])
            break;
        head = head->next;
    }
    if (head != NULL) {
        *value = strdup(tmp + len + 1);
        if (*value == NULL)
            return ERROR;
        return SUCCESS;
    }
    return ERROR;
}

static int is_var(
    char *var, char **value, linked_list_t *varlist, linked_list_t *env)
{
    node_t *head = varlist->head;

    if (*value != NULL)
        return SUCCESS;
    while (head != NULL) {
        if (strcmp(((var_t *)head->data)->var, var) == 0)
            break;
        head = head->next;
    }
    if (head != NULL) {
        *value = strdup(((var_t *)head->data)->value);
        if (*value == NULL)
            return ERROR;
    }
    return is_envvar(var, value, env);
}

static int handle_prev(char *var, char **value, int prev)
{
    int len = get_nblen(prev);

    if (*var != *str_management[QUESTION])
        return SUCCESS;
    *value = malloc(sizeof(char) * (len + 1));
    if (*value == NULL)
        return ERROR;
    sprintf(*value, "%d", prev);
    return SUCCESS;
}

static int check_change(
    char *command, int ind, int prev_value, const char prev_quote)
{
    int value = SKIP;

    if (prev_quote == '\0'
        || *str_management[DOUBLE_QUOTE] != prev_quote) {
        value = is_between_str(command, ind, *str_management[DOUBLE_QUOTE],
            *str_management[DOUBLE_QUOTE]);
        if (value != SKIP)
            return check_change(
                command, value, SUCCESS, *str_management[DOUBLE_QUOTE]);
    }
    if (prev_quote == '\0'
        || *str_management[SIMPLE_QUOTE] != prev_quote) {
        value = is_between_str(command, ind, *str_management[SIMPLE_QUOTE],
            *str_management[SIMPLE_QUOTE]);
        if (value != SKIP)
            return check_change(
                command, value, SKIP, *str_management[SIMPLE_QUOTE]);
    }
    return prev_value;
}

static char *get_var_name(char *var)
{
    char *tmp = strdup(var);
    char *name = NULL;

    if (tmp == NULL)
        return NULL;
    name = strtok(tmp, " \"\'\n");
    if (name == NULL) {
        free(tmp);
        return NULL;
    }
    name = strdup(name);
    free(tmp);
    return name;
}

static bool modify_command(char **command, char *var, char *value, int ind)
{
    int end = ind + strlen(var);
    int len = strlen(*command) + strlen(value) - strlen(var);
    char *new = malloc(sizeof(char) * (len + 1));

    if (new == NULL) {
        my_free_str(command);
        return true;
    }
    new[ind] = '\0';
    strncpy(new, *command, ind);
    strcat(new, value);
    strcat(new, *command + end + 1);
    new[len] = '\0';
    free(*command);
    free(var);
    free(value);
    *command = new;
    return true;
}

static bool replace_var(
    char **command, system_t *sys, int ind, int *return_value)
{
    char *var = NULL;
    char *value = NULL;

    if ((*command)[ind + 1] == *str_management[SIMPLE_QUOTE]
        || (*command)[ind + 1] == '\n'
        || check_change(*command, ind, SUCCESS, '\0') == SKIP)
        return false;
    var = get_var_name(*command + ind + 1);
    if (var == NULL) {
        my_free_str(command);
        return true;
    }
    if (handle_prev(var, &value, *return_value) == ERROR
        || is_var(var, &value, sys->var, sys->env) == ERROR) {
        dprintf(STDERR_FILENO, str_message[UND_VAR], var);
        *return_value = COMMAND_ERROR;
        free(var);
        return true;
    }
    return modify_command(command, var, value, ind);
}

static int check_error(char *command, int *return_value)
{
    if (command == NULL) {
        *return_value = ERROR;
        return ERROR;
    }
    if (*return_value == COMMAND_ERROR) {
        free(command);
        return ERROR;
    }
    return SUCCESS;
}

char *handle_var(char *command, system_t *sys, int *return_value)
{
    bool tmp = false;

    if (command == NULL) {
        *return_value = ERROR;
        return NULL;
    }
    if (command[0] == '\0')
        return command;
    for (int i = 0; command[i + 1] != '\0'; i++) {
        if (command[i] == *str_management[DOLLAR])
            tmp = replace_var(&command, sys, i, return_value);
        if (tmp != false && check_error(command, return_value) == ERROR)
            return NULL;
    }
    return command;
}
