<?php

namespace Iquesters\UserInterface\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormValue extends Model
{
    use HasFactory;

    protected $table = 'form_values';

    // Allow mass assignment for these fields
    protected $fillable = [
        'form_uid',
        'field_key',
        'field_value'
    ];

    public function refCreatedBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function refUpdatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
