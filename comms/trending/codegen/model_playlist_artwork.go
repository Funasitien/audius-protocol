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

// checks if the PlaylistArtwork type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &PlaylistArtwork{}

// PlaylistArtwork struct for PlaylistArtwork
type PlaylistArtwork struct {
	Var150x150 *string `json:"150x150,omitempty"`
	Var480x480 *string `json:"480x480,omitempty"`
	Var1000x1000 *string `json:"1000x1000,omitempty"`
}

// NewPlaylistArtwork instantiates a new PlaylistArtwork object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewPlaylistArtwork() *PlaylistArtwork {
	this := PlaylistArtwork{}
	return &this
}

// NewPlaylistArtworkWithDefaults instantiates a new PlaylistArtwork object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewPlaylistArtworkWithDefaults() *PlaylistArtwork {
	this := PlaylistArtwork{}
	return &this
}

// GetVar150x150 returns the Var150x150 field value if set, zero value otherwise.
func (o *PlaylistArtwork) GetVar150x150() string {
	if o == nil || IsNil(o.Var150x150) {
		var ret string
		return ret
	}
	return *o.Var150x150
}

// GetVar150x150Ok returns a tuple with the Var150x150 field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *PlaylistArtwork) GetVar150x150Ok() (*string, bool) {
	if o == nil || IsNil(o.Var150x150) {
		return nil, false
	}
	return o.Var150x150, true
}

// HasVar150x150 returns a boolean if a field has been set.
func (o *PlaylistArtwork) HasVar150x150() bool {
	if o != nil && !IsNil(o.Var150x150) {
		return true
	}

	return false
}

// SetVar150x150 gets a reference to the given string and assigns it to the Var150x150 field.
func (o *PlaylistArtwork) SetVar150x150(v string) {
	o.Var150x150 = &v
}

// GetVar480x480 returns the Var480x480 field value if set, zero value otherwise.
func (o *PlaylistArtwork) GetVar480x480() string {
	if o == nil || IsNil(o.Var480x480) {
		var ret string
		return ret
	}
	return *o.Var480x480
}

// GetVar480x480Ok returns a tuple with the Var480x480 field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *PlaylistArtwork) GetVar480x480Ok() (*string, bool) {
	if o == nil || IsNil(o.Var480x480) {
		return nil, false
	}
	return o.Var480x480, true
}

// HasVar480x480 returns a boolean if a field has been set.
func (o *PlaylistArtwork) HasVar480x480() bool {
	if o != nil && !IsNil(o.Var480x480) {
		return true
	}

	return false
}

// SetVar480x480 gets a reference to the given string and assigns it to the Var480x480 field.
func (o *PlaylistArtwork) SetVar480x480(v string) {
	o.Var480x480 = &v
}

// GetVar1000x1000 returns the Var1000x1000 field value if set, zero value otherwise.
func (o *PlaylistArtwork) GetVar1000x1000() string {
	if o == nil || IsNil(o.Var1000x1000) {
		var ret string
		return ret
	}
	return *o.Var1000x1000
}

// GetVar1000x1000Ok returns a tuple with the Var1000x1000 field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *PlaylistArtwork) GetVar1000x1000Ok() (*string, bool) {
	if o == nil || IsNil(o.Var1000x1000) {
		return nil, false
	}
	return o.Var1000x1000, true
}

// HasVar1000x1000 returns a boolean if a field has been set.
func (o *PlaylistArtwork) HasVar1000x1000() bool {
	if o != nil && !IsNil(o.Var1000x1000) {
		return true
	}

	return false
}

// SetVar1000x1000 gets a reference to the given string and assigns it to the Var1000x1000 field.
func (o *PlaylistArtwork) SetVar1000x1000(v string) {
	o.Var1000x1000 = &v
}

func (o PlaylistArtwork) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o PlaylistArtwork) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Var150x150) {
		toSerialize["150x150"] = o.Var150x150
	}
	if !IsNil(o.Var480x480) {
		toSerialize["480x480"] = o.Var480x480
	}
	if !IsNil(o.Var1000x1000) {
		toSerialize["1000x1000"] = o.Var1000x1000
	}
	return toSerialize, nil
}

type NullablePlaylistArtwork struct {
	value *PlaylistArtwork
	isSet bool
}

func (v NullablePlaylistArtwork) Get() *PlaylistArtwork {
	return v.value
}

func (v *NullablePlaylistArtwork) Set(val *PlaylistArtwork) {
	v.value = val
	v.isSet = true
}

func (v NullablePlaylistArtwork) IsSet() bool {
	return v.isSet
}

func (v *NullablePlaylistArtwork) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullablePlaylistArtwork(val *PlaylistArtwork) *NullablePlaylistArtwork {
	return &NullablePlaylistArtwork{value: val, isSet: true}
}

func (v NullablePlaylistArtwork) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullablePlaylistArtwork) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


