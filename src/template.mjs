const Template = (data) => {
    return {
        render(to) {
            const elem = document.querySelector(to)
            if (!elem)
                throw new Error(`'${to}' cannot be found.`)


        }
    }
}

export { Template }
