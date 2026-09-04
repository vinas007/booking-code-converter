# Integration Research Checklist

This checklist must be completed for each bookmaker before implementation begins. Every item must be verified through official documentation, legitimate API testing, or direct confirmation from the bookmaker.

## Per-Bookmaker Checklist

Copy this checklist for each bookmaker being investigated.

### Bookmaker: _______________

- [ ] Official API/documentation identified
- [ ] Terms of service allow intended use
- [ ] Authentication method identified
- [ ] Booking-code resolution verified
- [ ] Selection format verified
- [ ] Event identification verified
- [ ] Market identification verified
- [ ] Target availability verification possible
- [ ] Booking-code creation verified
- [ ] Rate limits known
- [ ] Error responses understood
- [ ] Test cases available

### Completion Criteria

An adapter may only be implemented for a bookmaker when:
1. At minimum, "Official API/documentation identified" and "Terms of service allow intended use" are both checked.
2. Each capability being implemented has its corresponding verification item checked.
3. Any unchecked item is documented as unsupported with a clear reason.

### Capability Mapping

| Checklist Item                        | Adapter Capability           |
|---------------------------------------|------------------------------|
| Booking-code resolution verified      | canResolveBookingCode        |
| Selection format verified             | canLoadSelections            |
| Event identification verified         | canFindEvents                |
| Market identification verified        | canFindMarkets               |
| Target availability verification      | canValidateSelections        |
| Booking-code creation verified        | canCreateBookingCode          |
