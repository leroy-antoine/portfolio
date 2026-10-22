/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_repeat
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <string.h>
#include <unistd.h>

static int repeat_loop(char **args, system_t *sys, int nb)
{
    int status = format_scripting(&args, sys);

    if (status != EXIT_SUCCESS)
        return status;
    for (int i = 0; status != EPI_ERROR && i < nb; i++) {
        status = exec_proper_function(dup_list(args), sys, status);
        if (sys->has_exited == true)
            break;
    }
    return status;
}

int do_repeat(char **args, system_t *sys)
{
    int is_nb = MY_NAN;

    if (args[1] == NULL || args[2] == NULL) {
        dprintf(STDERR_FILENO, "%s", str_message[REPEAT_TOO_FEW]);
        return COMMAND_ERROR;
    }
    is_nb = is_int_float(args[1]);
    if (is_nb == MY_NAN || is_nb == RATIONAL) {
        dprintf(STDERR_FILENO, "%s", str_message[REPEAT_BAD_NB]);
        return COMMAND_ERROR;
    }
    return repeat_loop(args + 2, sys, atoi(args[1]));
}
