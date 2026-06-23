<?php

namespace Iquesters\UserInterface\Constants;

class EntityListParams
{
    // Reserved query parameters
    const PARAM_OFFSET = 'offset';
    const PARAM_LENGTH = 'length';
    const PARAM_SORT   = 'sort';
    const PARAM_FILTER = 'filter';

    // Filter operators
    const OP_EQ     = 'eq';
    const OP_NEQ    = 'neq';
    const OP_GT     = 'gt';
    const OP_GTE    = 'gte';
    const OP_LT     = 'lt';
    const OP_LTE    = 'lte';
    const OP_LIKE   = 'like';
    const OP_STARTS = 'starts';
    const OP_ENDS   = 'ends';
    const OP_IN     = 'in';

    // Sort directions
    const DIR_ASC  = 'asc';
    const DIR_DESC = 'desc';
}
