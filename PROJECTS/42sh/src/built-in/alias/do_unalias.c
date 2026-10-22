/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_unalias
*/

#include <unistd.h>

#include "mysh.h"
#include "formatsh.h"
#include "my.h"

int do_unalias(char **arg, system_t *sys)
{
    int i = 0;

    arg++;
    if (arg[0] == NULL) {
        dprintf(STDERR_FILENO, "%s", str_message[UNALIAS]);
        return COMMAND_ERROR;
    }
    while (arg[i] != NULL) {
        del_alias_node(sys->alias, arg[i]);
        i++;
    }
    return EPI_SUCCESS;
}
