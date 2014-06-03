var ResponseStatusCode = {
    "success": 0,
    "system_err": -1,
    "invalidate_acc_or_pwd": -2,
    "need_wechat_token": -3,
    "acc_not_exists": -4,
    "acc_access_forbidden": -5,
    "need_verify": -6,
    "acc_not_activated": -7,
    "acc_been_reg": -8,
    "wrong_password": -9,
    "acc_not_login": -10,
    "verify_not_match": -32,
    "acc_not_email": -94,
    "acc_not_mobile": -95
}

exports.ResponseStatusCode = ResponseStatusCode;