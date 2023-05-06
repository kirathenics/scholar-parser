export const sorting = async (profiles, field, sequence) => {
    profiles.sort((a, b) => a[field] > b[field] ? sequence : -sequence)
    return profiles
}