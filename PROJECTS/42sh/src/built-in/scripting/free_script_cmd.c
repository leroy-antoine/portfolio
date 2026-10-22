/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_script_cmd
*/

#include "mysh.h"
#include "my.h"

void free_script_cmd(void *data)
{
    script_cmd_t *script_cmd = (script_cmd_t *)data;

    free(script_cmd->cmd);
    free(script_cmd);
}
