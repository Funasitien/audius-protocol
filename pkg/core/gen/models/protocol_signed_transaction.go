// Code generated by go-swagger; DO NOT EDIT.

package models

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"context"

	"github.com/go-openapi/errors"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/swag"
)

// ProtocolSignedTransaction protocol signed transaction
//
// swagger:model protocolSignedTransaction
type ProtocolSignedTransaction struct {

	// manage entity
	ManageEntity *ProtocolManageEntityLegacy `json:"manageEntity,omitempty"`

	// plays
	Plays *ProtocolTrackPlays `json:"plays,omitempty"`

	// request Id
	RequestID string `json:"requestId,omitempty"`

	// signature
	Signature string `json:"signature,omitempty"`

	// sla rollup
	SLARollup *ProtocolSLARollup `json:"slaRollup,omitempty"`

	// validator registration
	ValidatorRegistration *ProtocolValidatorRegistration `json:"validatorRegistration,omitempty"`
}

// Validate validates this protocol signed transaction
func (m *ProtocolSignedTransaction) Validate(formats strfmt.Registry) error {
	var res []error

	if err := m.validateManageEntity(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validatePlays(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateSLARollup(formats); err != nil {
		res = append(res, err)
	}

	if err := m.validateValidatorRegistration(formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *ProtocolSignedTransaction) validateManageEntity(formats strfmt.Registry) error {
	if swag.IsZero(m.ManageEntity) { // not required
		return nil
	}

	if m.ManageEntity != nil {
		if err := m.ManageEntity.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("manageEntity")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("manageEntity")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) validatePlays(formats strfmt.Registry) error {
	if swag.IsZero(m.Plays) { // not required
		return nil
	}

	if m.Plays != nil {
		if err := m.Plays.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("plays")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("plays")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) validateSLARollup(formats strfmt.Registry) error {
	if swag.IsZero(m.SLARollup) { // not required
		return nil
	}

	if m.SLARollup != nil {
		if err := m.SLARollup.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("slaRollup")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("slaRollup")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) validateValidatorRegistration(formats strfmt.Registry) error {
	if swag.IsZero(m.ValidatorRegistration) { // not required
		return nil
	}

	if m.ValidatorRegistration != nil {
		if err := m.ValidatorRegistration.Validate(formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("validatorRegistration")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("validatorRegistration")
			}
			return err
		}
	}

	return nil
}

// ContextValidate validate this protocol signed transaction based on the context it is used
func (m *ProtocolSignedTransaction) ContextValidate(ctx context.Context, formats strfmt.Registry) error {
	var res []error

	if err := m.contextValidateManageEntity(ctx, formats); err != nil {
		res = append(res, err)
	}

	if err := m.contextValidatePlays(ctx, formats); err != nil {
		res = append(res, err)
	}

	if err := m.contextValidateSLARollup(ctx, formats); err != nil {
		res = append(res, err)
	}

	if err := m.contextValidateValidatorRegistration(ctx, formats); err != nil {
		res = append(res, err)
	}

	if len(res) > 0 {
		return errors.CompositeValidationError(res...)
	}
	return nil
}

func (m *ProtocolSignedTransaction) contextValidateManageEntity(ctx context.Context, formats strfmt.Registry) error {

	if m.ManageEntity != nil {

		if swag.IsZero(m.ManageEntity) { // not required
			return nil
		}

		if err := m.ManageEntity.ContextValidate(ctx, formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("manageEntity")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("manageEntity")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) contextValidatePlays(ctx context.Context, formats strfmt.Registry) error {

	if m.Plays != nil {

		if swag.IsZero(m.Plays) { // not required
			return nil
		}

		if err := m.Plays.ContextValidate(ctx, formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("plays")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("plays")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) contextValidateSLARollup(ctx context.Context, formats strfmt.Registry) error {

	if m.SLARollup != nil {

		if swag.IsZero(m.SLARollup) { // not required
			return nil
		}

		if err := m.SLARollup.ContextValidate(ctx, formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("slaRollup")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("slaRollup")
			}
			return err
		}
	}

	return nil
}

func (m *ProtocolSignedTransaction) contextValidateValidatorRegistration(ctx context.Context, formats strfmt.Registry) error {

	if m.ValidatorRegistration != nil {

		if swag.IsZero(m.ValidatorRegistration) { // not required
			return nil
		}

		if err := m.ValidatorRegistration.ContextValidate(ctx, formats); err != nil {
			if ve, ok := err.(*errors.Validation); ok {
				return ve.ValidateName("validatorRegistration")
			} else if ce, ok := err.(*errors.CompositeError); ok {
				return ce.ValidateName("validatorRegistration")
			}
			return err
		}
	}

	return nil
}

// MarshalBinary interface implementation
func (m *ProtocolSignedTransaction) MarshalBinary() ([]byte, error) {
	if m == nil {
		return nil, nil
	}
	return swag.WriteJSON(m)
}

// UnmarshalBinary interface implementation
func (m *ProtocolSignedTransaction) UnmarshalBinary(b []byte) error {
	var res ProtocolSignedTransaction
	if err := swag.ReadJSON(b, &res); err != nil {
		return err
	}
	*m = res
	return nil
}
