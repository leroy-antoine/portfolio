/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** test_42sh
*/

#include <criterion/criterion.h>
#include <criterion/redirect.h>
#include <fcntl.h>
#include <signal.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>

#include "formatsh.h"
#include "mysh.h"
#include "my.h"
#include "../../include/mysh.h"

void redirect_all_std(void)
{
    cr_redirect_stdout();
    cr_redirect_stderr();
}

static int test_main(const char *file)
{
    char path[1024] = "tests/unitest/";
    strcat(path, file);

    int saved_stdin = dup(STDIN_FILENO);
    int saved_stdout = dup(STDOUT_FILENO);
    int saved_stderr = dup(STDERR_FILENO);
    int input_fd = open(path, O_RDONLY);
    int result = EXIT_SUCCESS;

    if (input_fd == -1)
        return EXIT_FAILURE;
    int bin = open("/dev/null", O_WRONLY);
    if (bin != -1) {
        dup2(bin, STDOUT_FILENO);
        dup2(bin, STDERR_FILENO);
    }
    if (dup2(input_fd, STDIN_FILENO) == -1) {
        perror("dup2 failed");
        return EXIT_FAILURE;
    }

    char PATH[1024] = "PATH=";
    strcat(PATH, getenv("PATH"));
    char HOME[1024] = "HOME=";
    strcat(HOME, getenv("HOME"));
    char *env[4] = {PATH, HOME, NULL};

    close(input_fd);
    system_t *system = initialize_system(env);

    result = mysh(system);
    dup2(saved_stdin, STDIN_FILENO);
    dup2(saved_stdout, STDOUT_FILENO);
    dup2(saved_stderr, STDERR_FILENO);
    close(saved_stdin);
    return result;
}

//prompt

Test(prompt, prompt_test, .init = redirect_all_std)
{
    prompt_t var = {0};
    char *buff = malloc(100);
    char *wd = getcwd(NULL, PATH_MAX_LEN);
    int len = 0;
    char *home = strdup("a");
    system_t sys = {NULL};

    sys.prompt = NULL;
    var.hostname = strdup("host");
    var.status = 0;
    var.user = strdup("user");
    sprintf(buff, "%s%s>%s ✭ %s%s%s\n%d%s - %s%s➤ %s", str_term_caps[MAGENTA],
        wd, str_term_caps[BLUE], str_term_caps[YELLOW], var.hostname,
        str_term_caps[GREEN], var.status, str_term_caps[RESET],
        str_term_caps[CYAN], var.user, str_term_caps[RESET]);
    prompt(&var, home, &sys);
    cr_assert_stdout_eq_str(buff);
}

Test(prompt, prompt_test_home_NULL, .init = redirect_all_std)
{
    prompt_t var = {0};
    char *buff = malloc(100);
    char *wd = getcwd(NULL, PATH_MAX_LEN);
    int len = 0;
    char *home = NULL;
    system_t sys = {NULL};

    sys.prompt = NULL;
    var.hostname = strdup("host");
    var.status = 0;
    var.user = strdup("user");
    sprintf(buff, "%s%s>%s ✭ %s%s%s\n%d%s - %s%s➤ %s", str_term_caps[MAGENTA],
        wd, str_term_caps[BLUE], str_term_caps[YELLOW], var.hostname,
        str_term_caps[GREEN], var.status, str_term_caps[RESET],
        str_term_caps[CYAN], var.user, str_term_caps[RESET]);
    prompt(&var, home, &sys);
    cr_assert_stdout_eq_str(buff);
}

Test(prompt, prompt_test_in_home_var, .init = redirect_all_std)
{
    prompt_t var = {0};
    char *buff = malloc(100);
    char *wd = getcwd(NULL, PATH_MAX_LEN);
    int len = 0;
    char *home = strdup("/usr");
    system_t sys = {NULL};

    sys.prompt = NULL;
    var.hostname = strdup("host");
    var.status = 0;
    var.user = strdup("user");
    int fd = open("tmp", O_WRONLY | O_TRUNC);
    dprintf(fd, "%s\t%s\t%s\n", home, wd, wd + 4);
    close(fd);
    sprintf(buff, "%s~%s>%s ✭ %s%s%s\n%d%s - %s%s➤ %s", str_term_caps[MAGENTA],
        wd + 4, str_term_caps[BLUE], str_term_caps[YELLOW], var.hostname,
        str_term_caps[GREEN], var.status, str_term_caps[RESET],
        str_term_caps[CYAN], var.user, str_term_caps[RESET]);
    prompt(&var, home, &sys);
    cr_assert_stdout_eq_str(buff);
}

Test(prompt, prompt_test_status_1, .init = redirect_all_std)
{
    prompt_t var = {0};
    char *buff = malloc(100);
    char *wd = getcwd(NULL, PATH_MAX_LEN);
    int len = 0;
    char *home = strdup("a");
    system_t sys = {NULL};

    sys.prompt = NULL;
    var.hostname = strdup("host");
    var.status = 1;
    var.user = strdup("user");
    sprintf(buff, "%s%s>%s ✭ %s%s%s\n%d%s - %s%s➤ %s", str_term_caps[MAGENTA],
        wd, str_term_caps[BLUE], str_term_caps[YELLOW], var.hostname,
        str_term_caps[RED], var.status, str_term_caps[RESET],
        str_term_caps[CYAN], var.user, str_term_caps[RESET]);
    prompt(&var, home, &sys);
    cr_assert_stdout_eq_str(buff);
}

// SIMPLE CMD

Test(mysh, SUCCESS_simple_cmd)
{
    int result = test_main("SUCCESS_simple_cmd");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_simple_cmd)
{
    int result = test_main("ERROR_simple_cmd");

    cr_assert_eq(result, 2);
}

Test(mysh, ERROR_cmd_not_exist)
{
    int result = test_main("ERROR_cmd_not_exist");

    cr_assert_eq(result, 1);
}

// SEGFAULT

Test(mysh, ERROR_floating_point)
{
    int result = test_main("ERROR_floating_point");

    cr_assert_eq(result, 136);
}

// DIRECTORY

Test(mysh, ERROR_directory)
{
    int result = test_main("ERROR_directory");

    cr_assert_eq(result, 1);
}

// SEMICOLON

Test(mysh, SUCCESS_semicolon)
{
    int result = test_main("SUCCESS_semicolon");

    cr_assert_eq(result, 0);
}

// PIPE

Test(mysh, SUCCESS_pipe)
{
    int result = test_main("SUCCESS_pipe");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_pipe_builtin)
{
    int result = test_main("SUCCESS_pipe_builtin");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_pipe_no_arg_before)
{
    int result = test_main("ERROR_pipe_no_arg_before");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_pipe_no_arg_after)
{
    int result = test_main("ERROR_pipe_no_arg_after");

    cr_assert_eq(result, 1);
}

// CD

Test(mysh, SUCCESS_cd_simple)
{
    int result = test_main("SUCCESS_cd_simple");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_cd_dir)
{
    int result = test_main("SUCCESS_cd_dir");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_cd_not_dir)
{
    int result = test_main("ERROR_cd_not_dir");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_cd_old)
{
    int result = test_main("SUCCESS_cd_old");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_cd_wave)
{
    int result = test_main("SUCCESS_cd_wave");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_cd_wave_user)
{
    int result = test_main("SUCCESS_cd_wave_user");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_cd)
{
    int result = test_main("ERROR_cd");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_cd2)
{
    int result = test_main("ERROR_cd2");

    cr_assert_eq(result, 1);
}

// EXIT

Test(mysh, SUCCESS_exit_no_arg)
{
    int result = test_main("SUCCESS_exit_no_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_exit_one_arg)
{
    int result = test_main("SUCCESS_exit_one_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_exit_two_arg)
{
    int result = test_main("ERROR_exit_two_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_exit_nan)
{
    int result = test_main("ERROR_exit_nan");

    cr_assert_eq(result, 1);
}

// ENV

Test(mysh, SUCCESS_env)
{
    int result = test_main("SUCCESS_env");

    cr_assert_eq(result, 0);
}

// SETENV

Test(mysh, SUCCESS_setenv_no_arg)
{
    int result = test_main("SUCCESS_setenv_no_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_setenv_one_arg)
{
    int result = test_main("SUCCESS_setenv_one_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_setenv_two_arg)
{
    int result = test_main("SUCCESS_setenv_two_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_setenv_three_arg)
{
    int result = test_main("ERROR_setenv_three_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_setenv_firts_letter)
{
    int result = test_main("ERROR_setenv_firts_letter");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_setenv_midle_letter)
{
    int result = test_main("ERROR_setenv_midle_letter");

    cr_assert_eq(result, 1);
}

// UNSETENV

Test(mysh, SUCCESS_unsetenv)
{
    int result = test_main("SUCCESS_unsetenv");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_unsetenv)
{
    int result = test_main("ERROR_unsetenv");

    cr_assert_eq(result, 1);
}

// REDIRECT OUT

Test(mysh, SUCCESS_redirect_simple_out)
{
    int result = test_main("SUCCESS_redirect_simple_out");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_redirect_double_out)
{
    int result = test_main("SUCCESS_redirect_double_out");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_redirect_simple_out_no_arg_before)
{
    int result = test_main("ERROR_redirect_simple_out_no_arg_before");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_double_out_no_arg_before)
{
    int result = test_main("ERROR_redirect_double_out_no_arg_before");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_simple_out_no_arg_after)
{
    int result = test_main("ERROR_redirect_simple_out_no_arg_after");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_double_out_no_arg_after)
{
    int result = test_main("ERROR_redirect_double_out_no_arg_after");

    cr_assert_eq(result, 1);
}

// REDIRECT OUT

Test(mysh, SUCCESS_redirect_simple_in)
{
    int result = test_main("SUCCESS_redirect_simple_in");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_redirect_double_in)
{
    int result = test_main("SUCCESS_redirect_double_in");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_simple_in_no_arg_before)
{
    int result = test_main("ERROR_redirect_simple_in_no_arg_before");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_double_in_no_arg_before)
{
    int result = test_main("ERROR_redirect_double_in_no_arg_before");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_simple_in_no_arg_after)
{
    int result = test_main("ERROR_redirect_simple_in_no_arg_after");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_double_in_no_arg_after)
{
    int result = test_main("ERROR_redirect_double_in_no_arg_after");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_redirect_simple_in_not_exist)
{
    int result = test_main("ERROR_redirect_simple_in_not_exist");

    cr_assert_eq(result, 1);
}

// ALIAS

Test(mysh, SUCCESS_alias_no_argument)
{
    int result = test_main("SUCCESS_alias_no_argument");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_alias_one_argument)
{
    int result = test_main("SUCCESS_alias_one_argument");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_alias_two_argument)
{
    int result = test_main("SUCCESS_alias_two_argument");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_alias_change_value)
{
    int result = test_main("SUCCESS_alias_change_value");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_alias_three_argument)
{
    int result = test_main("SUCCESS_alias_three_argument");

    cr_assert_eq(result, 0);
}

// UNALIAS

Test(mysh, ERROR_unalias_no_argument)
{
    int result = test_main("ERROR_unalias_no_argument");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_unalias_two_argument)
{
    int result = test_main("SUCCESS_unalias_two_argument");

    cr_assert_eq(result, 0);
}

// EXEC ALIAS

Test(mysh, SUCCESS_exec_alias)
{
    int result = test_main("SUCCESS_exec_alias");

    cr_assert_eq(result, 0);
}

Test(mysh, FAIL_exec_alias_alias_call_alias)
{
    int result = test_main("FAIL_exec_alias_alias_call_alias");

    cr_assert_eq(result, 1);
}

// HISTORY

Test(mysh, SUCCESS_do_history)
{
    int result = test_main("SUCCESS_do_history");

    cr_assert_eq(result, 0);
}

// WHICH

Test(mysh, SUCCESS_do_which)
{
    int result = test_main("SUCCESS_do_which");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_do_which_binary)
{
    int result = test_main("SUCCESS_do_which_binary");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_do_which_not_here)
{
    int result = test_main("ERROR_do_which_not_here");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_do_which_no_arg)
{
    int result = test_main("ERROR_do_which_no_arg");

    cr_assert_eq(result, 1);
}

// WHERE

Test(mysh, SUCCESS_do_where)
{
    int result = test_main("SUCCESS_do_where");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_do_where_not_here)
{
    int result = test_main("ERROR_do_where_not_here");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_do_where_path)
{
    int result = test_main("ERROR_do_where_path");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_do_where_no_arg)
{
    int result = test_main("ERROR_do_where_no_arg");

    cr_assert_eq(result, 1);
}

// REPEAT

Test(mysh, SUCCESS_repeat)
{
    int result = test_main("SUCCESS_repeat");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_do_repeat_no_arg)
{
    int result = test_main("ERROR_do_repeat_no_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_do_repeat_one_arg)
{
    int result = test_main("ERROR_do_repeat_one_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_do_repeat_nan)
{
    int result = test_main("ERROR_do_repeat_nan");

    cr_assert_eq(result, 1);
}

// OPERATEUR &&

Test(mysh, ERROR_invalid_and)
{
    int result = test_main("ERROR_invalid_and");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_valid_and)
{
    int result = test_main("SUCCESS_valid_and");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_error_and)
{
    int result = test_main("ERROR_error_and");

    cr_assert_eq(result, 1);
}

// OPERATEUR ||

Test(mysh, ERROR_invalid_or)
{
    int result = test_main("ERROR_invalid_or");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_valid_or)
{
    int result = test_main("SUCCESS_valid_or");

    cr_assert_eq(result, 0);
}

//JOB CONTROL
Test(mysh, SUCCESS_back_ls)
{
    int result = test_main("SUCCESS_back_ls");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_fg)
{
    int result = test_main("SUCCESS_fg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_fg_id)
{
    int result = test_main("SUCCESS_fg_id");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_fg_no_jobs)
{
    int result = test_main("ERROR_fg_no_jobs");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCES_jobs)
{
    int result = test_main("SUCCESS_jobs");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_jkill)
{
    int result = test_main("SUCCESS_jkill");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_jkill_no_jobs)
{
    int result = test_main("ERROR_jkill_no_jobs");

    cr_assert_eq(result, 84);
}

Test(mysh, ERROR_jkill_usage)
{
    int result = test_main("ERROR_jkill_usage");

    cr_assert_eq(result, 84);
}

Test(mysh, SUCCESS_jkill_all)
{
    int result = test_main("SUCCESS_jkill_all");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_fg_wrong_id)
{
    int result = test_main("ERROR_fg_wrong_id");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_fg_bad_id)
{
    int result = test_main("ERROR_fg_bad_id");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_signals)
{
    handle_signal(0);
}

Test(mysh, SUCCESS_handle_ctr_l)
{
    handle_ctrl_c(0);
}

Test(mysh, SUCCESS_fg_multiple_id)
{
    int result = test_main("SUCCESS_fg_multiple_id");

    cr_assert_eq(result, 0);
}

Test(mysh,  SUCCESS_kill_multiple_id)
{
    int result = test_main("SUCCESS_kill_multiple_id");

    cr_assert_eq(result, 0);
}

// FOREACH

Test(mysh, SUCCESS_foreach)
{
    int result = test_main("SUCCESS_foreach");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_foreach_no_args)
{
    int result = test_main("ERROR_foreach_no_args");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_foreach_one_args)
{
    int result = test_main("ERROR_foreach_one_args");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_foreach_too_much_args)
{
    int result = test_main("ERROR_foreach_too_much_args");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_missing_quote)
{
    int result = test_main("ERROR_missing_quote");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_star_no_match)
{
    int result = test_main("ERROR_star_no_match");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_star1)
{
    int result = test_main("SUCCESS_star1");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_star2)
{
    int result = test_main("SUCCESS_star2");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_and_or1)
{
    int result = test_main("ERROR_and_or1");

    cr_assert_eq(result, 2);
}

Test(mysh, ERROR_and_or2)
{
    int result = test_main("ERROR_and_or2");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_and_or3)
{
    int result = test_main("ERROR_and_or3");

    cr_assert_eq(result, 2);
}

Test(mysh, ERROR_and_or4)
{
    int result = test_main("ERROR_and_or4");

    cr_assert_eq(result, 2);
}

Test(mysh, ERROR_lot_and)
{
    int result = test_main("ERROR_lot_and");

    cr_assert_eq(result, 2);
}

Test(mysh, ERROR_lot_or)
{
    int result = test_main("ERROR_lot_or");

    cr_assert_eq(result, 2);
}

Test(mysh, SUCCESS_and_or1)
{
    int result = test_main("SUCCESS_and_or1");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_and_or2)
{
    int result = test_main("SUCCESS_and_or2");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_and_or3)
{
    int result = test_main("SUCCESS_and_or3");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_lot_and)
{
    int result = test_main("SUCCESS_lot_and");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_lot_or)
{
    int result = test_main("SUCCESS_lot_or");

    cr_assert_eq(result, 0);
}

// set

Test(mysh, SUCCESS_set_one_arg)
{
    int result = test_main("SUCCESS_set_one_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_set_one_arg_no_value)
{
    int result = test_main("SUCCESS_set_one_arg");

    cr_assert_eq(result, 0);
}


Test(mysh, SUCCESS_set_two_arg_no_value)
{
    int result = test_main("SUCCESS_set_two_arg_no_value");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_set_three_arg)
{
    int result = test_main("SUCCESS_set_three_arg");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_set_multiple_var)
{
    int result = test_main("SUCCESS_set_multiple_var");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_set_start_letter)
{
    int result = test_main("ERROR_set_start_letter");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_set_middle_letter)
{
    int result = test_main("ERROR_set_middle_letter");

    cr_assert_eq(result, 1);
}

// unset

Test(mysh, SUCCESS_unset_multiple_var)
{
    int result = test_main("SUCCESS_unset_multiple_var");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_unset_no_args)
{
    int result = test_main("ERROR_unset_no_args");

    cr_assert_eq(result, 1);
}

// use var

Test(mysh, SUCCESS_usevar_question_marq)
{
    int result = test_main("SUCCESS_usevar_question_marq");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_usevar_simple_quote)
{
    int result = test_main("SUCCESS_usevar_simple_quote");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_usevar_double_quote)
{
    int result = test_main("SUCCESS_usevar_double_quote");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_usevar_normal)
{
    int result = test_main("SUCCESS_usevar_normal");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_usevar_env)
{
    int result = test_main("SUCCESS_usevar_env");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_usevar_not_var)
{
    int result = test_main("ERROR_usevar_not_var");

    cr_assert_eq(result, 1);
}

// if

Test(mysh, ERROR_if_no_arg)
{
    int result = test_main("ERROR_if_no_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_if_one_nb)
{
    int result = test_main("SUCCESS_if_one_nb");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_if_one_nb)
{
    int result = test_main("ERROR_if_one_nb");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_if_one_nb_pare)
{
    int result = test_main("SUCCESS_if_one_nb_pare");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_if_one_nb_pare)
{
    int result = test_main("ERROR_if_one_nb_pare");

    cr_assert_eq(result, 1);
}

Test(mysh, SUCCESS_if_two_arg_nb)
{
    int result = test_main("SUCCESS_if_two_arg_nb");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_if_two_arg_str)
{
    int result = test_main("SUCCESS_if_two_arg_str");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_if_three_arg_nb)
{
    int result = test_main("SUCCESS_if_three_arg_nb");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_if_three_arg_str)
{
    int result = test_main("SUCCESS_if_three_arg_str");

    cr_assert_eq(result, 0);
}

Test(mysh, SUCCESS_if_one_sign_pare)
{
    int result = test_main("SUCCESS_if_one_sign_pare");

    cr_assert_eq(result, 0);
}

Test(mysh, ERROR_if_four_arg)
{
    int result = test_main("ERROR_if_four_arg");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_if_not_sign)
{
    int result = test_main("ERROR_if_not_sign");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_if_empty)
{
    int result = test_main("ERROR_if_empty");

    cr_assert_eq(result, 1);
}

Test(mysh, ERROR_if_too_much)
{
    int result = test_main("ERROR_if_too_much");

    cr_assert_eq(result, 1);
}
