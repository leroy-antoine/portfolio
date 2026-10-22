/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_if
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <string.h>
#include <unistd.h>

static int exec_no_then(char **args, system_t *sys)
{
    int status = format_scripting(&args, sys);

    if (status != EXIT_SUCCESS)
        return status;
    return exec_proper_function(dup_list(args), sys, status);
}

static int check_args(char **args, bool *condition, system_t *sys)
{
    int ind = 0;

    if (get_condition(args, condition, &ind) == ERROR) {
        dprintf(STDERR_FILENO, "%s", str_message[IF_SYNTAX]);
        return COMMAND_ERROR;
    }
    if (args[ind] == NULL) {
        dprintf(STDERR_FILENO, "%s", str_message[IF_EMPTY]);
        return COMMAND_ERROR;
    }
    if (strcmp(args[ind], str_message[THEN]) == 0) {
        if (args[ind + 1] != NULL) {
            dprintf(STDERR_FILENO, "%s", str_message[IF_IMPROPER]);
            return COMMAND_ERROR;
        }
        return SKIP;
    }
    if (*condition == false)
        return SUCCESS;
    return exec_no_then(args + ind, sys);
}

static void if_prompt(void)
{
    if (isatty(STANDARD_INPUT) == 1)
        dprintf(STDOUT_FILENO, "%s", str_message[IF_PROMPT]);
}

static int get_cmd(linked_list_t *list)
{
    size_t size = 0;
    char *cmd = NULL;
    int exit = 0;

    while (exit != EOF) {
        if_prompt();
        exit = getline(&cmd, &size, stdin);
        if (exit == EOF || strcmp(cmd, str_message[ENDIF]) == 0)
            break;
        if (add_script_cmd_node(list, cmd) == EPI_ERROR) {
            free(cmd);
            return EPI_ERROR;
        }
    }
    free(cmd);
    if (exit == EOF) {
        dprintf(STDERR_FILENO, "%s", str_message[THEN_NO_END]);
        return COMMAND_ERROR;
    }
    return SUCCESS;
}

static int exec_if_cmd(char **tab, system_t *sys)
{
    int status = 0;

    if (tab == NULL)
        return ERROR;
    status = format_scripting(&tab, sys);
    if (status != EXIT_SUCCESS) {
        free_list(tab);
        return status;
    }
    status = exec_proper_function(tab, sys, status);
    return status;
}

static int if_loop(
    linked_list_t *list, system_t *sys)
{
    node_t *head = list->head;
    int status = 0;
    char *cmd = NULL;
    char **tmp = NULL;

    while (head != NULL && sys->has_exited != true) {
        cmd = ((script_cmd_t *)head->data)->cmd;
        tmp = my_str_to_word_array(cmd, " \t\n", "");
        status = exec_if_cmd(tmp, sys);
        head = head->next;
    }
    free_linked_list(list, &free_script_cmd);
    return status;
}

int do_if(char **args, system_t *sys)
{
    linked_list_t *list = NULL;
    int check = 0;
    bool condition = false;

    if (args[1] == NULL || args[2] == NULL) {
        dprintf(STDERR_FILENO, "%s", str_message[IF_TOO_FEW]);
        return COMMAND_ERROR;
    }
    check = check_args(args + 1, &condition, sys);
    if (check != SKIP)
        return check;
    list = initialize_linked_list();
    if (list == NULL)
        return EPI_ERROR;
    check = get_cmd(list);
    if (check != SUCCESS)
        return check;
    if (condition == false)
        return SUCCESS;
    return if_loop(list, sys);
}
