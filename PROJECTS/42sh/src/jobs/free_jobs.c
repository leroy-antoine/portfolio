/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** free_jobs
*/

#include "my.h"
#include "mysh.h"

void free_jobs(void *data)
{
    jobs_t *jobs = (jobs_t *)(data);

    if (jobs == NULL)
        return;
    if (jobs->command_line != NULL)
        free_list(jobs->command_line);
    free(jobs);
}
