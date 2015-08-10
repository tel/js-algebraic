
testp:
	gulp test | faucet

test:
	gulp test

watch-tests:
	while true; do echo "---"; gulp test | faucet; sleep 2; done

PHONY: watch-tests
