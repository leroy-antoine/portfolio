/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** init_jobs
*/

#include "mysh.h"

linked_list_t *init_jobs(void)
{
    linked_list_t *list = initialize_linked_list();

    if (list == NULL)
        return NULL;
    return list;
}
