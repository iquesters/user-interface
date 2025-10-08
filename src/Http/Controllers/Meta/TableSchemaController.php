<?php

namespace Iquesters\UserInterface\Http\Controllers\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use App\Http\Controllers\Controller;
use Iquesters\UserInterface\Http\Controllers\Utils\StringUtil;
use Iquesters\UserInterface\Models\TableSchema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TableSchemaController extends Controller
{

    /**
     * Display a listing of the resource.
     * 
     * @return TableSchema[]
     */
    public function list()
    {
        $tables = TableSchema::where(['status' => EntityStatus::ACTIVE])->get();

        return view('userinterface::table-schemas.list', compact('tables'));
    }

    /**
     * This is the overview page for a single table
     * 
     * @param $id
     * @return TableSchema
     */
    public function overview($id)
    {
        $table = TableSchema::find($id);

        return view('userinterface::table-schemas.overview', compact('table'));
    }

    /**
     * Show the table for creating a new table.
     */
    public function create()
    {
        return view('userinterface::table-schemas.create');
    }

    /**
     * Store a newly created table resource in storage.
     * 
     * @param $request
     */
    public function store(Request $request)
    {
        // validate payload
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validation_expression = [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ];
        $validator = Validator::make($request->all(), $validation_expression, $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        // create slug
        $slug = isset($request['slug']) ? $request['slug'] : StringUtil::generateSlug($request['name']);

        // create table
        $result = TableSchema::create([
            // 'uid' => Str::ulid()->toString(),
            'uid' => (string) Str::ulid(),
            'name' => $request['name'],
            'slug' => $slug,
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info'],
            'status' => EntityStatus::ACTIVE
        ]);

        if ($result) {
            return redirect()->route('table.overview', $result->id)->with('success', 'Successfully created a table!');
        } else {
            return redirect()->back()->with('error', 'Failed to create a table!')->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, Request $request)
    {
        // validate payload
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validation_expression = [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ];
        $validator = Validator::make($request->all(), $validation_expression, $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        // table updated data
        // $table_data = [
        //     'name' => $request['name'],
        //     'description' => $request['description'],
        //     'schema' => $request['schema'],
        //     'extra_info' => $request['extra_info']
        // ];

        // update slug in table data
        // if (isset($request['slug'])) {
        //     $table_data['slug'] = $request['slug'];
        // }

        Log::info('table id=' . json_encode($id));
        // Log::info('table_data=' . json_encode($table_data));
        // create table
        $result = TableSchema::where(['id' => $id])->update([
            'name' => $request['name'],
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info']
        ]);

        if ($result) {
            return redirect()->route('table.overview', $id)->with('success', 'Successfully updated a table!');
        } else {
            return redirect()->back()->with('error', 'Failed to update a table!')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TableSchema $tableSchema)
    {
        //
    }

    public function delete() {}


    public function tableCreation($id = 0){
        $parent_id = $id;

        $data = (object)array(
            'parent_id' => $parent_id
        );

        if ($parent_id > 0) {
            $parent = TableSchema::where('uid', $parent_id)->first();
            $data->parent = $parent;
        }
        Log::info('table data: ' . json_encode($data));
        return view('userinterface::table-schemas.tablecreation', compact('data'));
    }
}
