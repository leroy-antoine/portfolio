/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** is_file.c
*/

#include <stdbool.h>
#include <sys/stat.h>

int is_file(char *path)
{
    struct stat file_stat = {0};

    if (stat(path, &file_stat) != -1 && S_ISREG(file_stat.st_mode) == true)
        return true;
    return false;
}
