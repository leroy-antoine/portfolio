/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** get_input.c
*/

#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <ncurses.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

static int handle_exclamation(char ***args, linked_list_t *history)
{
    node_t *node = NULL;
    char *tmp = NULL;
    char **prev_cmd = NULL;
    char **prev_separated_cmd = NULL;

    if (history == NULL || history->head == NULL || history->tail == NULL)
        return EPI_ERROR;
    node = history->tail;
    tmp = ((history_cmd_t *)(node->data))->cmd;
    if (tmp == NULL)
        return EPI_ERROR;
    prev_separated_cmd = my_str_to_word_array(tmp, " \n", "");
    prev_cmd = my_merge_word_array(prev_separated_cmd, &args[0][1]);
    free_list(prev_separated_cmd);
    if (prev_cmd == NULL)
        return EPI_ERROR;
    free_list(*args);
    *args = prev_cmd;
    return EPI_SUCCESS;
}

static int handle_history(char ***args, history_t *history)
{
    char *cmd = NULL;

    if (*args[0] == NULL)
        return EPI_ERROR;
    if (strcmp(*args[0], "!!") == 0)
        handle_exclamation(args, history->history);
    cmd = my_join_array(*args, " ");
    if (cmd == NULL)
        return EPI_ERROR;
    add_to_history(cmd, history);
    free(cmd);
    return EPI_SUCCESS;
}

static int is_command_error(prompt_t *variables)
{
    variables->status = COMMAND_ERROR;
    return COMMAND_ERROR;
}

static int format_tab_cmd(char ***args, prompt_t *variables, system_t *sys)
{
    if (handle_history(args, sys->history) == EPI_ERROR)
        return SUCCESS;
    check_alias(args, sys->alias);
    if (*args == NULL)
        return EPI_ERROR;
    if (replace_wave(*args, sys->env) == COMMAND_ERROR ||
        handle_star(args) == EPI_ERROR ||
        handle_question_mark(args) == EPI_ERROR)
        return is_command_error(variables);
    return EPI_SUCCESS;
}

static int check_pare(char **args)
{
    int count = 0;

    for (int i = 0; args[i] != NULL; i++) {
        if (*args[i] == *str_management[CLOSE_PARE])
            count--;
        if (*args[i] == *str_management[OPEN_PARE])
            count++;
        if (count == SKIP) {
            dprintf(STDERR_FILENO, "%s", str_message[TOO_MANY_CLOSE_PARE]);
            free_list(args);
            return COMMAND_ERROR;
        }
    }
    if (count != 0) {
        dprintf(STDERR_FILENO, "%s", str_message[TOO_MANY_OPEN_PARE]);
        free_list(args);
        return COMMAND_ERROR;
    }
    return SUCCESS;
}

static int check_tty(
    char **command, int *stop_getline, system_t *sys, prompt_t *vars)
{
    size_t size = 0;

    if (isatty(STANDARD_INPUT) == 0) {
        if (getline(command, &size, stdin) == EOF) {
            *stop_getline = EOF;
        }
    } else {
        if (prompt(vars, sys) == ERROR)
            return ERROR;
        *stop_getline = my_getline(sys->prompt, command, &size, sys->history);
    }
    return SUCCESS;
}

static int get_input_tty(prompt_t *variables, system_t *sys, char **command)
{
    int stop_getline = 0;

    if (check_tty(command, &stop_getline, sys, variables) == ERROR
    || stop_getline == EOF || *command == NULL) {
        free(*command);
        return EPI_ERROR;
    }
    return SUCCESS;
}

int get_input(char **command,
    char ***args, prompt_t *variables, system_t *sys)
{
    int return_value = 0;

    if (get_input_tty(variables, sys, command) == EPI_ERROR)
        return EPI_ERROR;
    if (strncmp(*command, "%", 1) == 0) {
        add_to_history(*command, sys->history);
        sys->input = NULL;
        return do_ia(sys, *command + 1);
    }
    sys->input = handle_var(format_cmd(*command), sys, &variables->status);
    if (sys->input == NULL)
        return return_value;
    *args = my_str_to_word_array(sys->input, " \n\t", "\"\'");
    if (*args == NULL)
        return is_command_error(variables);
    free(*command);
    if (check_pare(*args) == COMMAND_ERROR)
        return is_command_error(variables);
    return format_tab_cmd(args, variables, sys);
}
