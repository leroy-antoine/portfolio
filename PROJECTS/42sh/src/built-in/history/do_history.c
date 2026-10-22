/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_history
*/

#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include "my.h"
#include "mysh.h"
#include "formatsh.h"

static void print_history_line(void *data)
{
    history_cmd_t *history_cmd = (history_cmd_t *)data;

    printf(" %ld %s\n", history_cmd->line_nb, history_cmd->cmd);
    return;
}

static int print_history(linked_list_t *history, char *argv)
{
    int lines_nb = 0;
    node_t *node = NULL;

    if (argv == NULL){
        print_linked_list(history->head, print_history_line);
    } else {
        lines_nb = atoi(argv);
        if (lines_nb < 0){
            dprintf(STDERR_FILENO, "%s", str_message[BAD_NUMBER]);
            return EPI_ERROR;
        }
        node = get_nth_node(history, lines_nb - 1, FRM_END);
        print_linked_list(node, print_history_line);
    }
    return EPI_SUCCESS;
}

int do_history(char **args, system_t *sys)
{
    int argc = 0;
    int return_value = EPI_SUCCESS;

    if (args == NULL || sys == NULL || sys->history == NULL
        || sys->history->history == NULL)
        return EPI_ERROR;
    argc = my_list_len(args);
    if (argc > 2){
        dprintf(STDERR_FILENO, "%s", str_message[HISTORY_TOO_MANY]);
        return EPI_ERROR;
    }
    return_value = print_history(sys->history->history, args[1]);
    return return_value;
}
