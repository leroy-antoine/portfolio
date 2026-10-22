/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_foreach
*/

#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "mysh.h"
#include "formatsh.h"
#include "my.h"

static char **get_tab(char **args)
{
    int i = 0;
    int j = array_len(args);
    char **tab = NULL;

    if (strcmp(*args, str_management[OPEN_PARE]) == 0) {
        if (strcmp(args[j - 1], str_management[CLOSE_PARE]) != 0) {
            dprintf(STDERR_FILENO, "%s", str_message[FOREACH_NOT_PAR]);
            return NULL;
        }
        i++;
    } else if (j != 1) {
        dprintf(STDERR_FILENO, "%s", str_message[FOREACH_NOT_PAR]);
        return NULL;
    }
    tab = dup_list_ij(args, i, j);
    if (tab == NULL)
        return NULL;
    free(tab[array_len(tab) - 1]);
    tab[array_len(tab) - 1] = NULL;
    return tab;
}

static void foreach_prompt(void)
{
    if (isatty(STANDARD_INPUT) == 1)
        dprintf(STDOUT_FILENO, "%s", str_message[FOREACH_PROMPT]);
}

static int get_cmd(linked_list_t *list)
{
    size_t size = 0;
    char *cmd = NULL;
    int exit = 0;

    while (exit != EOF) {
        foreach_prompt();
        exit = getline(&cmd, &size, stdin);
        if (exit == EOF || strcmp(cmd, str_message[END]) == 0)
            break;
        if (add_script_cmd_node(list, cmd) == EPI_ERROR) {
            free(cmd);
            return EPI_ERROR;
        }
    }
    free(cmd);
    if (exit == EOF) {
        dprintf(STDERR_FILENO, "%s", str_message[FOREACH_NO_END]);
        return COMMAND_ERROR;
    }
    return SUCCESS;
}

static int change_var(char **tab, char *value, char *var)
{
    char *tmp = NULL;

    if (tab == NULL)
        return EPI_ERROR;
    for (int i = 0; tab[i] != NULL; i++) {
        if (*tab[i] == '$' && strcmp(tab[i] + 1, var) == 0)
            tmp = strdup(value);
        else
            tmp = NULL;
        if (tmp != NULL) {
            free(tab[i]);
            tab[i] = tmp;
        }
    }
    return EPI_SUCCESS;
}

static int exec_foreach_cmd(char **tab, char *value, system_t *sys, char *var)
{
    int status = 0;

    if (change_var(tab, value, var) == EPI_ERROR)
        return EPI_ERROR;
    status = format_scripting(&tab, sys);
    if (status != EXIT_SUCCESS) {
        free_list(tab);
        return status;
    }
    status = exec_proper_function(tab, sys, status);
    return status;
}

static int foreach_loop(
    linked_list_t *list, char **tab, system_t *sys, char *var)
{
    node_t *head = list->head;
    int status = 0;
    char *cmd = NULL;
    char **tmp = NULL;

    for (int i = 0; tab[i] != NULL; i++) {
        head = list->head;
        while (head != NULL && sys->has_exited != true) {
            cmd = ((script_cmd_t *)head->data)->cmd;
            tmp = my_str_to_word_array(cmd, " \t\n", "");
            status = exec_foreach_cmd(tmp, tab[i], sys, var);
            head = head->next;
        }
    }
    free_list(tab);
    free_linked_list(list, &free_script_cmd);
    return status;
}

int do_foreach(char **args, system_t *sys)
{
    char **tab = NULL;
    linked_list_t *list = initialize_linked_list();
    int check = 0;

    if (list == NULL)
        return EPI_ERROR;
    if (args[1] == NULL || args[2] == NULL) {
        dprintf(STDERR_FILENO, "%s", str_message[FOREACH_TOO_FEW]);
        free_linked_list(list, &free_script_cmd);
        return COMMAND_ERROR;
    }
    tab = get_tab(args + 2);
    if (tab == NULL) {
        free_linked_list(list, &free_script_cmd);
        return COMMAND_ERROR;
    }
    check = get_cmd(list);
    if (check != SUCCESS)
        return check;
    return foreach_loop(list, tab, sys, args[1]);
}
