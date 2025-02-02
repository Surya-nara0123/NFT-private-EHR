package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// EHRFraction represents a fraction of the EHR
type EHRFraction struct {
	Type        string `json:"type"`
	DataIpfs    string `json:"dataIpfs"`
	AccessLevel string `json:"accessLevel"`
	Owner       string `json:"owner"`
}

// PrivateFractionalEHRNFT represents the structure of our private fractional EHR NFT
type PrivateFractionalEHRNFT struct {
	ID        string                 `json:"id"`
	Fractions map[string]EHRFraction `json:"fractions"`
}

// PrivateFractionalEHRNFTContract provides functions for managing private fractional EHR NFTs
type PrivateFractionalEHRNFTContract struct {
	contractapi.Contract
}

func (c *PrivateFractionalEHRNFTContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

// CreatePrivateFractionalEHRNFT creates a new private fractional EHR NFT
func (c *PrivateFractionalEHRNFTContract) CreatePrivateFractionalEHRNFT(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := c.PrivateFractionalEHRNFTExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the private fractional EHR NFT %s already exists", id)
	}

	ehr := PrivateFractionalEHRNFT{
		ID:        id,
		Fractions: make(map[string]EHRFraction),
	}

	ehrJSON, err := json.Marshal(ehr)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutPrivateData("EHRCollection", id, ehrJSON)
}

// AddEHRFraction adds a new fraction to the private EHR NFT
func (c *PrivateFractionalEHRNFTContract) AddEHRFraction(ctx contractapi.TransactionContextInterface, id string, fractionType string, DataIpfs string, accessLevel string) error {
	ehr, err := c.ReadPrivateFractionalEHRNFT(ctx, id)
	if err != nil {
		return err
	}

	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}

	ehr.Fractions[fractionType] = EHRFraction{
		Type:        fractionType,
		DataIpfs:    DataIpfs,
		AccessLevel: accessLevel,
		Owner:       clientID,
	}

	ehrJSON, err := json.Marshal(ehr)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutPrivateData("EHRCollection", id, ehrJSON)
}

// ReadPrivateFractionalEHRNFT retrieves a private fractional EHR NFT from the private data collection
func (c *PrivateFractionalEHRNFTContract) ReadPrivateFractionalEHRNFT(ctx contractapi.TransactionContextInterface, id string) (*PrivateFractionalEHRNFT, error) {
	ehrJSON, err := ctx.GetStub().GetPrivateData("EHRCollection", id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from private data collection: %v", err)
	}
	if ehrJSON == nil {
		return nil, fmt.Errorf("the private fractional EHR NFT %s does not exist", id)
	}

	var ehr PrivateFractionalEHRNFT
	err = json.Unmarshal(ehrJSON, &ehr)
	if err != nil {
		return nil, err
	}

	return &ehr, nil
}

// ReadEHRFraction retrieves a specific fraction of a private EHR NFT
func (c *PrivateFractionalEHRNFTContract) ReadEHRFraction(ctx contractapi.TransactionContextInterface, id string, fractionType string) (*EHRFraction, error) {
	ehr, err := c.ReadPrivateFractionalEHRNFT(ctx, id)
	if err != nil {
		return nil, err
	}

	fraction, exists := ehr.Fractions[fractionType]
	if !exists {
		return nil, fmt.Errorf("fraction %s does not exist in EHR %s", fractionType, id)
	}

	// Check if the caller has the right to access this fraction
	err = c.verifyCallerAccess(ctx, fraction.AccessLevel, fraction.Owner)
	if err != nil {
		return nil, err
	}

	return &fraction, nil
}

// TransferEHRFraction transfers ownership of a specific EHR fraction to a new owner
func (c *PrivateFractionalEHRNFTContract) TransferEHRFraction(ctx contractapi.TransactionContextInterface, id string, fractionType string, newOwner string) error {
	ehr, err := c.ReadPrivateFractionalEHRNFT(ctx, id)
	if err != nil {
		return err
	}

	fraction, exists := ehr.Fractions[fractionType]
	if !exists {
		return fmt.Errorf("fraction %s does not exist in EHR %s", fractionType, id)
	}

	// Check if the caller is the current owner of the fraction
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}

	if fraction.Owner != clientID {
		return fmt.Errorf("caller is not the owner of this fraction")
	}

	// Transfer ownership
	fraction.Owner = newOwner
	ehr.Fractions[fractionType] = fraction

	ehrJSON, err := json.Marshal(ehr)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutPrivateData("EHRCollection", id, ehrJSON)
}

// PrivateFractionalEHRNFTExists returns true when a Private Fractional EHR NFT with the given ID exists in the private data collection
func (c *PrivateFractionalEHRNFTContract) PrivateFractionalEHRNFTExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	ehrJSON, err := ctx.GetStub().GetPrivateData("EHRCollection", id)
	if err != nil {
		return false, fmt.Errorf("failed to read from private data collection: %v", err)
	}

	return ehrJSON != nil, nil
}

// verifyCallerAccess checks if the caller has the right to access a specific fraction
func (c *PrivateFractionalEHRNFTContract) verifyCallerAccess(ctx contractapi.TransactionContextInterface, requiredAccessLevel string, owner string) error {
	// In a real-world scenario, you would implement more sophisticated access control here
	// This is a simplified example
	callerID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get caller identity: %v", err)
	}

	// Check if the caller has the required access level
	// This is a placeholder and should be replaced with actual access control logic
	if requiredAccessLevel == "RESTRICTED" {
		// Check if the caller is authorized for restricted access
		// This is a simplified check and should be replaced with proper authorization logic
		if callerID != owner {
			return fmt.Errorf("caller does not have the required access level")
		}
	}

	return nil
}

func (c *PrivateFractionalEHRNFTContract) ChangeNFTFractionAccess(ctx contractapi.TransactionContextInterface, newAccessLevel string, id string, fractionType string) error {
	ehr, err := c.ReadPrivateFractionalEHRNFT(ctx, id)
	if err != nil {
		return err
	}

	fraction, exists := ehr.Fractions[fractionType]
	if !exists {
		return fmt.Errorf("fraction %s does not exist in EHR %s", fractionType, id)
	}

	fraction.AccessLevel = newAccessLevel
	ehr.Fractions[fractionType] = fraction

	ehrJSON, err := json.Marshal(ehr)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutPrivateData("EHRCollection", id, ehrJSON)

}

func (c *PrivateFractionalEHRNFTContract) ReturnCallerID(ctx contractapi.TransactionContextInterface) (string, error) {
	// In a real-world scenario, you would implement more sophisticated access control here
	// This is a simplified example
	callerID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("failed to get caller identity: %v", err)
	}

	return callerID, nil
}

func main() {
	privateFractionalEHRNFTChaincode, err := contractapi.NewChaincode(&PrivateFractionalEHRNFTContract{})
	if err != nil {
		fmt.Printf("Error creating private fractional EHR NFT chaincode: %v", err)
		return
	}

	if err := privateFractionalEHRNFTChaincode.Start(); err != nil {
		fmt.Printf("Error starting private fractional EHR NFT chaincode: %v", err)
	}
}
