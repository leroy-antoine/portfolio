/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_ctrl_z
*/

#include <signal.h>
#include <unistd.h>

#include "mysh.h"

void do_ctrl_z(system_t *sys, char **command, pid_t pid,
    int *status)
{
    jobs_t *data = NULL;

    if (status != NULL)
        *status = EPI_SUCCESS;
    kill(pid, SIGTSTP);
    if (sys == NULL || command == NULL)
        return;
    fill_jobs_infos(sys->jobs, pid, command);
    data = sys->jobs->head->data;
    dprintf(STDOUT_FILENO, "Suspended [%ld] ", data->ID);
    for (size_t i = 0; data->command_line[i] != NULL; i++)
        dprintf(STDOUT_FILENO, "%s ", data->command_line[i]);
    dprintf(STDOUT_FILENO, "\n");
}
