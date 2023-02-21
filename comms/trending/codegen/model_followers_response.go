/*
API

Audius V1 API

API version: 1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package codegen

import (
	"encoding/json"
)

// checks if the FollowersResponse type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &FollowersResponse{}

// FollowersResponse struct for FollowersResponse
type FollowersResponse struct {
	Data []User `json:"data,omitempty"`
}

// NewFollowersResponse instantiates a new FollowersResponse object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewFollowersResponse() *FollowersResponse {
	this := FollowersResponse{}
	return &this
}

// NewFollowersResponseWithDefaults instantiates a new FollowersResponse object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewFollowersResponseWithDefaults() *FollowersResponse {
	this := FollowersResponse{}
	return &this
}

// GetData returns the Data field value if set, zero value otherwise.
func (o *FollowersResponse) GetData() []User {
	if o == nil || IsNil(o.Data) {
		var ret []User
		return ret
	}
	return o.Data
}

// GetDataOk returns a tuple with the Data field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *FollowersResponse) GetDataOk() ([]User, bool) {
	if o == nil || IsNil(o.Data) {
		return nil, false
	}
	return o.Data, true
}

// HasData returns a boolean if a field has been set.
func (o *FollowersResponse) HasData() bool {
	if o != nil && !IsNil(o.Data) {
		return true
	}

	return false
}

// SetData gets a reference to the given []User and assigns it to the Data field.
func (o *FollowersResponse) SetData(v []User) {
	o.Data = v
}

func (o FollowersResponse) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o FollowersResponse) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Data) {
		toSerialize["data"] = o.Data
	}
	return toSerialize, nil
}

type NullableFollowersResponse struct {
	value *FollowersResponse
	isSet bool
}

func (v NullableFollowersResponse) Get() *FollowersResponse {
	return v.value
}

func (v *NullableFollowersResponse) Set(val *FollowersResponse) {
	v.value = val
	v.isSet = true
}

func (v NullableFollowersResponse) IsSet() bool {
	return v.isSet
}

func (v *NullableFollowersResponse) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableFollowersResponse(val *FollowersResponse) *NullableFollowersResponse {
	return &NullableFollowersResponse{value: val, isSet: true}
}

func (v NullableFollowersResponse) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableFollowersResponse) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


